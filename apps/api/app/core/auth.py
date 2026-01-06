"""
Clerk JWT verification module.
Verifies session tokens using Clerk's JWKS endpoint.
"""
from typing import Optional
from fastapi import HTTPException, Request
import httpx
from jose import jwt, JWTError, jwk
from jose.exceptions import JWKError

from app.core.config import settings


class ClerkAuth:
    """Handles Clerk JWT verification using JWKS."""
    
    def __init__(self):
        self._jwks_cache: Optional[dict] = None
    
    async def get_jwks(self) -> dict:
        """Fetch JWKS from Clerk. Cached after first fetch."""
        if self._jwks_cache:
            return self._jwks_cache
        
        clerk_issuer = settings.CLERK_ISSUER
        if not clerk_issuer:
            raise HTTPException(500, "CLERK_ISSUER not configured")
        
        jwks_url = f"{clerk_issuer}/.well-known/jwks.json"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url)
            if response.status_code != 200:
                raise HTTPException(500, "Failed to fetch Clerk JWKS")
            self._jwks_cache = response.json()
        
        return self._jwks_cache
    
    def get_signing_key(self, token: str, jwks: dict) -> str:
        """Extract the correct signing key from JWKS for the token."""
        try:
            unverified_header = jwt.get_unverified_header(token)
        except JWTError:
            raise HTTPException(401, "Invalid token header")
        
        kid = unverified_header.get("kid")
        if not kid:
            raise HTTPException(401, "Token missing key ID")
        
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                return key
        
        raise HTTPException(401, "Signing key not found")
    
    async def verify_token(self, token: str) -> dict:
        """Verify Clerk JWT and return payload with user_id."""
        jwks = await self.get_jwks()
        signing_key = self.get_signing_key(token, jwks)
        
        try:
            # Convert JWK to PEM for verification
            public_key = jwk.construct(signing_key)
            
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"verify_aud": False},  # Clerk doesn't always set aud
            )
            
            return payload
            
        except JWTError as e:
            raise HTTPException(401, f"Token verification failed: {str(e)}")
        except JWKError as e:
            raise HTTPException(401, f"Key error: {str(e)}")


# Global instance
clerk_auth = ClerkAuth()


async def verify_clerk_session(request: Request) -> str:
    """
    FastAPI dependency to verify Clerk session token.
    Returns the user_id (Clerk's 'sub' claim).
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(401, "Missing Authorization header")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Invalid Authorization format. Use 'Bearer <token>'")
    
    token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(401, "Empty token")
    
    payload = await clerk_auth.verify_token(token)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Token missing user ID")
    
    return user_id


async def get_current_user_id(request: Request) -> str:
    """
    Dependency alias for verify_clerk_session.
    Use this in route handlers.
    """
    return await verify_clerk_session(request)
