import ssl
from unittest.mock import MagicMock, patch

from app.db import ssl as db_ssl


def test_asyncpg_disable_ssl():
    settings = MagicMock(db_sslmode="disable", skip_tls_verify=False, db_ssl_root_cert=None)
    with patch("app.db.ssl.get_settings", return_value=settings):
        assert db_ssl.asyncpg_connect_kwargs() == {"ssl": False}


def test_asyncpg_insecure_from_settings():
    settings = MagicMock(db_sslmode="verify-full", skip_tls_verify=True, db_ssl_root_cert=None)
    with patch("app.db.ssl.get_settings", return_value=settings):
        kwargs = db_ssl.asyncpg_connect_kwargs()
        ctx = kwargs["ssl"]
        assert isinstance(ctx, ssl.SSLContext)
        assert ctx.verify_mode == ssl.CERT_NONE


def test_psycopg_insecure_query():
    settings = MagicMock(db_sslmode="require", skip_tls_verify=True, db_ssl_root_cert=None)
    with patch("app.db.ssl.get_settings", return_value=settings):
        assert db_ssl.psycopg_ssl_query() == "sslmode=require"
