from unittest.mock import MagicMock, patch

from app.http.ssl import http_ssl_verify


def test_http_ssl_verify_uses_settings():
    settings = MagicMock(skip_tls_verify=True)
    with patch("app.config.get_settings", return_value=settings):
        assert http_ssl_verify() is False


def test_http_ssl_verify_default():
    settings = MagicMock(skip_tls_verify=False)
    with patch("app.config.get_settings", return_value=settings):
        assert http_ssl_verify() is True
