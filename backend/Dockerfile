FROM python:3.12-slim

WORKDIR /app
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip

RUN pip install "gunicorn>=21.2.0"

COPY pyproject.toml poetry.lock ./
RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root && \
    poetry add psycopg2-binary

COPY . .
COPY front/static /app/static

EXPOSE 8000