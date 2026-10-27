"""
MedInsight AI — API Routes.
Exposes endpoints for analysis job creation, status polling, report retrieval,
PDF export, and system health checks.
"""

import logging
from pathlib import Path
from typing import Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import HTMLResponse

from config import settings
from api.models import (
    AnalysisResponse,
    AnalysisStatus,
    AnalysisStatusResponse,
    ErrorResponse,
    ExtractionPreview,
    FileType,
    HealthResponse,
    MedicalReport,
)
from services.batch_manager import batch_manager
from services.file_validator import file_validator
from services.rag.vector_store import vector_store

logger = logging.getLogger("medinsight.api.routes")

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".txt"}


@router.post(
    "/analysis",
    response_model=AnalysisResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit medical documents for analysis",
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file format or size limits exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server processing error"},
    },
)
async def submit_analysis(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(..., description="One or more medical record documents"),
):
    """
    Accepts uploaded medical documents (PDF, JPG, PNG, TXT), validates sizes,
    creates a batch analysis job, and launches background clinical analysis.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one file must be uploaded.",
        )

    if len(files) > settings.max_files_per_batch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Exceeded maximum file count of {settings.max_files_per_batch} per batch.",
        )

    uploaded_items: list[tuple[str, bytes]] = []

    for f in files:
        filename = f.filename or "unnamed_document"
        content = await f.read()

        # Perform comprehensive file validation (extension, magic bytes, corruption)
        val_result = file_validator.validate_bytes(content, filename)
        if not val_result.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Validation failed for '{filename}': {'; '.join(val_result.errors)}",
            )

        uploaded_items.append((filename, content))

    try:
        analysis_id = batch_manager.create_analysis_job(uploaded_items)
        # Schedule background task with FastAPI BackgroundTasks
        background_tasks.add_task(batch_manager._process_batch, analysis_id)

        return AnalysisResponse(
            analysis_id=analysis_id,
            status=AnalysisStatus.UPLOADING,
            message="Document analysis initiated in the background.",
        )
    except Exception as e:
        logger.error(f"Failed to initiate analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create analysis job: {str(e)}",
        )


@router.get(
    "/analysis/{analysis_id}",
    response_model=AnalysisStatusResponse,
    summary="Get status and progress of an analysis job",
    responses={404: {"model": ErrorResponse, "description": "Analysis ID not found"}},
)
async def get_analysis_status(analysis_id: str):
    """
    Poll the current status, stage detail, and progress percentage of an analysis job.
    """
    status_response = batch_manager.get_status(analysis_id)
    if not status_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{analysis_id}' was not found.",
        )
    return status_response


@router.get(
    "/analysis/{analysis_id}/report",
    response_model=MedicalReport,
    summary="Get complete 16-section MedicalReport JSON",
    responses={
        400: {"model": ErrorResponse, "description": "Analysis not yet completed"},
        404: {"model": ErrorResponse, "description": "Analysis ID not found"},
    },
)
async def get_analysis_report(analysis_id: str):
    """
    Retrieve the full structured 16-section MedicalReport for a completed analysis.
    """
    status_resp = batch_manager.get_status(analysis_id)
    if not status_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{analysis_id}' was not found.",
        )

    if status_resp.status == AnalysisStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Analysis failed: {status_resp.error or 'Unknown error'}",
        )

    if status_resp.status != AnalysisStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Report is not ready yet. Current status: '{status_resp.status}' ({status_resp.stage_detail})",
        )

    report = batch_manager.get_report(analysis_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report artifact could not be located.",
        )
    return report


@router.get(
    "/analysis/{analysis_id}/report.pdf",
    summary="Download or view analysis report as PDF",
    responses={
        400: {"model": ErrorResponse, "description": "Analysis not yet completed"},
        404: {"model": ErrorResponse, "description": "Analysis ID not found"},
    },
)
async def get_analysis_pdf(analysis_id: str):
    """
    Download or stream the generated PDF clinical report.
    """
    status_resp = batch_manager.get_status(analysis_id)
    if not status_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{analysis_id}' was not found.",
        )

    if status_resp.status != AnalysisStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"PDF is not ready yet. Current status: '{status_resp.status}'",
        )

    pdf_bytes = batch_manager.get_pdf(analysis_id)
    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF artifact could not be located.",
        )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="medical_report_{analysis_id}.pdf"',
        },
    )


@router.get(
    "/analysis/{analysis_id}/report.html",
    response_class=HTMLResponse,
    summary="View analysis report as styled HTML",
    responses={
        400: {"model": ErrorResponse, "description": "Analysis not yet completed"},
        404: {"model": ErrorResponse, "description": "Analysis ID not found"},
    },
)
async def get_analysis_html(analysis_id: str):
    """
    Render and view the complete analysis report directly in the browser as styled HTML.
    """
    status_resp = batch_manager.get_status(analysis_id)
    if not status_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{analysis_id}' was not found.",
        )

    if status_resp.status != AnalysisStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"HTML report is not ready yet. Current status: '{status_resp.status}'",
        )

    html_content = batch_manager.get_html(analysis_id)
    if not html_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HTML artifact could not be located.",
        )

    return HTMLResponse(content=html_content)


@router.get(
    "/analysis/{analysis_id}/preview",
    response_model=ExtractionPreview,
    summary="Preview extracted text layers before analysis finishes",
    responses={404: {"model": ErrorResponse, "description": "Analysis ID not found"}},
)
async def get_extraction_preview(analysis_id: str):
    """
    Get intermediate extraction preview (document pages, text, and uncertainty flags).
    """
    item = batch_manager._analyses.get(analysis_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job '{analysis_id}' was not found.",
        )

    docs = item.extracted_docs or []
    total_pages = sum(d.total_pages for d in docs)
    has_unc = any(any(p.uncertain_words for p in d.pages) for d in docs)

    return ExtractionPreview(
        analysis_id=analysis_id,
        documents=docs,
        total_pages=total_pages,
        has_uncertainties=has_unc,
        uncertain_items=[],
    )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Check health status of backend services",
)
async def health_check():
    """
    Returns system status, active vector store count, and connectivity status.
    """
    services_status = {}

    # Check Vector Store
    try:
        count = await vector_store.count()
        services_status["vector_store"] = f"connected ({count} documents indexed)"
    except Exception as e:
        services_status["vector_store"] = f"unhealthy ({str(e)})"

    # Check Google Gemini API configuration
    if settings.google_api_key:
        services_status["llm_api"] = f"configured ({settings.llm_model})"
        services_status["embedding_api"] = f"configured ({settings.embedding_model})"
    else:
        services_status["llm_api"] = "warning (GOOGLE_API_KEY not set)"
        services_status["embedding_api"] = "warning (using fallback embeddings)"

    # Check storage directories
    services_status["upload_storage"] = "ready" if settings.get_upload_path().exists() else "missing"
    services_status["temp_storage"] = "ready" if settings.get_temp_path().exists() else "missing"

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        services=services_status,
    )
