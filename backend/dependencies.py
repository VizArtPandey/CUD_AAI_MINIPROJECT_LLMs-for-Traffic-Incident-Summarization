from functools import lru_cache
@lru_cache(maxsize=1)
def app_metadata():
    return {"name": "Traffic Incident Summarization API", "version": "0.1.0"}
