import sys
import json
from app.core.database import SessionLocal
from app.schemas.medicine import AlternativeSearchRequest
from app.services.alternatives import AlternativeMatchingService


def main():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            print(json.dumps({"error": "Empty input"}))
            return
        data = json.loads(raw)
        req = AlternativeSearchRequest(**data)
        db = SessionLocal()
        try:
            res = AlternativeMatchingService.match_alternatives(db, req)
            # Pydantic v2 .model_dump() or v1 .dict()
            if hasattr(res, "model_dump"):
                out = res.model_dump(mode="json")
            else:
                out = json.loads(res.json())
            print(json.dumps(out))
        finally:
            db.close()
    except Exception as e:
        print(json.dumps({"error": str(e), "total_candidates": 0, "candidates": []}))


if __name__ == "__main__":
    main()
