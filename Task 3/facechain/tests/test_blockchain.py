import pytest
from pipeline.verifier import verify_fingerprint

def test_verify_fingerprint_no_tx(monkeypatch):
    # Mock extract_fingerprint to return None
    monkeypatch.setattr("pipeline.verifier.extract_fingerprint_from_transaction", lambda x: None)
    assert verify_fingerprint("0xbad", "hash") == "INVALID TRANSACTION"

def test_verify_fingerprint_match(monkeypatch):
    monkeypatch.setattr("pipeline.verifier.extract_fingerprint_from_transaction", lambda x: "myhash")
    assert verify_fingerprint("0xgood", "myhash") == "VERIFIED"

def test_verify_fingerprint_tamper(monkeypatch):
    monkeypatch.setattr("pipeline.verifier.extract_fingerprint_from_transaction", lambda x: "originalhash")
    assert verify_fingerprint("0xtampered", "tamperedhash") == "TAMPER DETECTED"
