FROM python:3.12-slim

WORKDIR /app
ENV PYTHONUNBUFFERED 1

RUN pip install gunicorn==20.1.0

COPY pyproject.toml poetry.lock ./
RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root

COPY . .
COPY front/static /app/static

EXPOSE 8000