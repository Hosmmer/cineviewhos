import logging

logger = logging.getLogger("apps")


def log_service_call(func):
    def wrapper(*args, **kwargs):
        logger.debug(f"Calling {func.__name__}")
        try:
            result = func(*args, **kwargs)
            logger.debug(f"{func.__name__} completed")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} failed: {e}")
            raise

    return wrapper
