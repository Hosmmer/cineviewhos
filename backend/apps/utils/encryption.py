from cryptography.fernet import Fernet
import os


def get_fernet():
    key = os.environ.get("FERNET_KEY", "").encode()
    if key:
        return Fernet(key)
    return None


def encrypt_value(value: str) -> str:
    f = get_fernet()
    if f:
        return f.encrypt(value.encode()).decode()
    return value


def decrypt_value(value: str) -> str:
    f = get_fernet()
    if f:
        return f.decrypt(value.encode()).decode()
    return value
