def test_search_exact_match(client):
    response = client.get("/api/v1/medicines/search?q=Dolo 650")
    assert response.status_code == 200
    data = response.json()
    assert data["match_type"] == "exact"
    assert data["total"] >= 1
    assert data["items"][0]["brand_name"] == "Dolo 650"
    assert data["items"][0]["dosage_form"] == "Tablet"
    assert len(data["items"][0]["ingredients"]) == 1
    assert data["items"][0]["ingredients"][0]["name"] == "Paracetamol"
    assert data["items"][0]["ingredients"][0]["strength_value"] == 650.0


def test_search_partial_by_ingredient(client):
    response = client.get("/api/v1/medicines/search?q=Paracetamol")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    brand_names = [item["brand_name"] for item in data["items"]]
    assert "Dolo 650" in brand_names
    assert "Calpol 500" in brand_names


def test_search_jan_aushadhi_only(client):
    response = client.get("/api/v1/medicines/search?q=Paracetamol&jan_aushadhi_only=true")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["is_jan_aushadhi"] is True


def test_search_unknown_brand(client):
    response = client.get("/api/v1/medicines/search?q=NonExistentPharma12345")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["items"]) == 0


def test_get_medicine_detail_with_source_metadata(client):
    # Medicine ID 1 is Dolo 650
    response = client.get("/api/v1/medicines/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["brand_name"] == "Dolo 650"
    assert data["source"] is not None
    assert "Verified Branded Market Retail" in data["source"]["source_name"]
    assert len(data["price_history"]) >= 1
    assert data["price_history"][0]["amount_inr"] == 30.0
    assert data["price_history"][0]["verification_status"] == "verified"


def test_get_medicine_detail_not_found(client):
    response = client.get("/api/v1/medicines/999999")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()
