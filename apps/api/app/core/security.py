"""
Security utilities: encryption and session-only key storage.
"""
from datetime import datetime, timedelta
from typing import Optional
from cryptography.fernet import Fernet
import json

from app.core.config import settings


class SessionKeyStore:
    """
    In-memory key store with TTL. Keys are NEVER persisted to disk or database.
    This is intentional for security - keys are lost on server restart.
    """
    
    def __init__(self, ttl_hours: int = 24):
        self._keys: dict[str, tuple[str, datetime]] = {}
        self.ttl = timedelta(hours=ttl_hours)
    
    def store(self, user_id: str, key: str) -> None:
        """Store an OpenAI key for a user with timestamp."""
        self._keys[user_id] = (key, datetime.utcnow())
    
    def get(self, user_id: str) -> Optional[str]:
        """Get a stored key if it exists and hasn't expired."""
        if user_id not in self._keys:
            return None
        key, stored_at = self._keys[user_id]
        if datetime.utcnow() - stored_at > self.ttl:
            del self._keys[user_id]
            return None
        return key
    
    def clear(self, user_id: str) -> None:
        """Remove a user's key from the store."""
        self._keys.pop(user_id, None)
    
    def has_key(self, user_id: str) -> bool:
        """Check if a valid key exists for the user."""
        return self.get(user_id) is not None
    
    def refresh(self, user_id: str) -> bool:
        """Refresh the TTL for a user's key. Returns False if no key exists."""
        if user_id not in self._keys:
            return False
        key, _ = self._keys[user_id]
        self._keys[user_id] = (key, datetime.utcnow())
        return True


# Global instance
key_store = SessionKeyStore(ttl_hours=settings.OPENAI_KEY_TTL_HOURS)


class DataEncryptor:
    """
    Handles encryption/decryption of sensitive data (like resume content).
    Uses Fernet (AES-256) for symmetric encryption.
    """
    
    def __init__(self, key: Optional[str] = None):
        encryption_key = key or settings.ENCRYPTION_KEY
        if not encryption_key:
            # Generate a key if not provided (for development)
            encryption_key = Fernet.generate_key().decode()
        self._fernet = Fernet(encryption_key.encode() if isinstance(encryption_key, str) else encryption_key)
    
    def encrypt(self, data: dict) -> str:
        """Encrypt a dictionary to a string."""
        json_str = json.dumps(data)
        encrypted = self._fernet.encrypt(json_str.encode())
        return encrypted.decode()
    
    def decrypt(self, encrypted_data: str) -> dict:
        """Decrypt a string back to a dictionary."""
        decrypted = self._fernet.decrypt(encrypted_data.encode())
        return json.loads(decrypted.decode())


# Global encryptor instance
encryptor = DataEncryptor()
