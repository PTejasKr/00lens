"""
test_github_app.py — Unit tests for github_app.py
"""

import unittest
from unittest.mock import patch, MagicMock
import os
import json
import time

# Ensure backend directory is in path
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from github_app import (
    verify_webhook_signature,
    generate_app_jwt,
    get_installation_token,
    create_check_run,
    update_check_run
)

class TestGitHubApp(unittest.TestCase):

    @patch.dict(os.environ, {"GITHUB_APP_WEBHOOK_SECRET": "secret123"})
    def test_verify_webhook_signature_valid(self):
        import hmac, hashlib
        payload = b'{"action": "opened"}'
        expected_hex = hmac.new(b'secret123', msg=payload, digestmod=hashlib.sha256).hexdigest()
        signature = f"sha256={expected_hex}"
        self.assertTrue(verify_webhook_signature(payload, signature))

    @patch.dict(os.environ, {"GITHUB_APP_WEBHOOK_SECRET": "secret123"})
    def test_verify_webhook_signature_invalid(self):
        payload = b'{"action": "opened"}'
        signature = "sha256=wrongsignature"
        self.assertFalse(verify_webhook_signature(payload, signature))

    @patch.dict(os.environ, {}, clear=True)
    def test_verify_webhook_signature_no_secret(self):
        # Should log a warning and return True in development if secret not set
        payload = b'{"action": "opened"}'
        self.assertTrue(verify_webhook_signature(payload, None))

    @patch("jwt.encode")
    @patch.dict(os.environ, {"GITHUB_APP_ID": "12345", "GITHUB_APP_PRIVATE_KEY": "mock_key"})
    def test_generate_app_jwt(self, mock_jwt_encode):
        mock_jwt_encode.return_value = "mock_encoded_jwt"
        token = generate_app_jwt()
        self.assertEqual(token, "mock_encoded_jwt")
        mock_jwt_encode.assert_called_once()

    @patch("github_app.generate_app_jwt")
    @patch("urllib.request.urlopen")
    def test_get_installation_token_success(self, mock_urlopen, mock_gen_jwt):
        mock_gen_jwt.return_value = "mock_jwt"
        
        # Mocking context manager for urlopen
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({"token": "installation_token_abc"}).encode()
        mock_urlopen.return_value.__enter__.return_value = mock_response

        token = get_installation_token(99999)
        self.assertEqual(token, "installation_token_abc")

    @patch("urllib.request.urlopen")
    def test_create_check_run_success(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({"id": 123456}).encode()
        mock_urlopen.return_value.__enter__.return_value = mock_response

        check_run_id = create_check_run("owner", "repo", "sha123", "token123")
        self.assertEqual(check_run_id, 123456)

    @patch("urllib.request.urlopen")
    def test_update_check_run_success(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.status = 200
        mock_urlopen.return_value.__enter__.return_value = mock_response

        success = update_check_run("owner", "repo", 123456, "token123", "completed", "success")
        self.assertTrue(success)

if __name__ == "__main__":
    unittest.main()
