import os
import tempfile
import pytest
from fastapi.testclient import TestClient

@pytest.fixture()
def client(monkeypatch):
    # Use a fresh isolated database for each test.
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{path}")
    from app import database
    from app import main
    database.engine.dispose()
    # The modules use an engine created at import time; create tables in this engine.
    database.Base.metadata.create_all(bind=database.engine)
    with TestClient(main.app) as test_client:
        yield test_client
    database.Base.metadata.drop_all(bind=database.engine)
    database.engine.dispose()
    try:
        os.remove(path)
    except OSError:
        pass
