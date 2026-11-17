import os

bind = f"0.0.0.0:{os.environ.get('PORT', '9090')}"
workers = int(os.environ.get("WEB_CONCURRENCY", 3))
timeout = 30
accesslog = "-"   # logs a stdout, útil en Docker
errorlog = "-"