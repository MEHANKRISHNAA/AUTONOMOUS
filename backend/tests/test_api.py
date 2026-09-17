from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_resume_bundle_loads():
    response = client.get("/resume")
    assert response.status_code == 200
    assert response.json()["profile"]["name"]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

