"""Token encryption using Fernet (symmetric AES-128-CBC + HMAC)."""
import base64
import hashlib

from cryptography.fernet import Fernet

from backend.config import settings


def _fernet() -> Fernet:
    # Derive a 32-byte key from SECRET_KEY
    key = base64.urlsafe_b64encode(
        hashlib.sha256(settings.secret_key.encode()).digest()
    )
    return Fernet(key)


def encrypt_token(token: str) -> str:
    return _fernet().encrypt(token.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    return _fernet().decrypt(encrypted.encode()).decode()
