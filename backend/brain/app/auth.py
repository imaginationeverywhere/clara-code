from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def require_api_key(
  creds: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
) -> None:
  expected = (settings.clara_brain_api_key or "").strip()
  if not expected:
    raise HTTPException(status_code=503, detail="CLARA_BRAIN_API_KEY not configured on server")
  if creds is None or creds.scheme.lower() != "bearer":
    raise HTTPException(status_code=401, detail="Missing Bearer token")
  if creds.credentials != expected:
    raise HTTPException(status_code=401, detail="Invalid API key")
