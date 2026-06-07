from fastapi import Request, HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import redis
from src.core.config import settings
import time

redis_client = redis.Redis(
    host=settings.REDIS_HOST if hasattr(settings, 'REDIS_HOST') else 'localhost',
    port=settings.REDIS_PORT if hasattr(settings, 'REDIS_PORT') else 6379,
    decode_responses=True
)


class CustomRateLimiter:
    def __init__(self):
        self.limiter = Limiter(key_func=get_remote_address)

    def get_limiter(self):
        return self.limiter

    def rate_limit(self, limit: str, key_func=None):
        """Rate limit decorator with custom limit"""
        return self.limiter.limit(limit, key_func=key_func)


rate_limiter = CustomRateLimiter()

RATE_LIMITS = {
    "auth_register": "5/minute",
    "auth_login": "10/minute",
    "get_campaigns": "60/minute",
    "create_campaign": "30/minute",
    "update_campaign": "30/minute",
    "delete_campaign": "10/minute",
    "claim_coupon": "3/minute",
    "redeem_coupon": "10/minute",
    "check_geofence": "60/minute",
    "get_stats": "120/minute",
}


def setup_rate_limiting(app):
    """Setup rate limiting for FastAPI app"""
    app.state.limiter = rate_limiter.get_limiter()
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


class RateLimitMiddleware:
    """Middleware for rate limiting based on user ID if available"""

    async def __call__(self, request: Request, call_next):
        user_id = None
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            try:
                from src.core.security import decode_token
                token = auth_header.replace("Bearer ", "")
                payload = decode_token(token)
                user_id = payload.get("sub")
            except Exception:
                pass

        client_ip = get_remote_address(request)
        key_prefix = f"rate_limit:{client_ip}"

        if user_id:
            key_prefix = f"rate_limit:user:{user_id}"

        path = request.url.path
        limit = None

        if "/auth/register" in path:
            limit = RATE_LIMITS["auth_register"]
        elif "/auth/login" in path:
            limit = RATE_LIMITS["auth_login"]
        elif "/campaigns" in path and request.method == "GET":
            limit = RATE_LIMITS["get_campaigns"]
        elif "/campaigns" in path and request.method == "POST":
            limit = RATE_LIMITS["create_campaign"]
        elif "/coupons/claim" in path:
            limit = RATE_LIMITS["claim_coupon"]
        elif "/coupons/redeem" in path:
            limit = RATE_LIMITS["redeem_coupon"]
        elif "/geofencing/check" in path:
            limit = RATE_LIMITS["check_geofence"]
        elif "/analytics" in path or "/stats" in path:
            limit = RATE_LIMITS["get_stats"]

        if limit:
            parts = limit.split("/")
            max_requests = int(parts[0])
            time_window = 60 if "minute" in parts[1] else 1

            key = f"{key_prefix}:{path}"
            current = redis_client.get(key)

            if current is None:
                redis_client.setex(key, time_window, 1)
            else:
                count = int(current)
                if count >= max_requests:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Rate limit exceeded. Maximum {max_requests} requests per {time_window} seconds."
                    )
                redis_client.incr(key)

        response = await call_next(request)
        return response
