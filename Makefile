PROJECT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
POETRY_RUN := poetry run python
MANAGE_DIR := $(PROJECT_DIR)/backend/manage.py
DJANGO_RUN := $(POETRY_RUN) $(MANAGE_DIR)
REACT_DIR := $(PROJECT_DIR)/frontend

include .env.dev
export

DEFAUL_GOAL := help

help:
	@echo "run-dev          Start app in dev mode"
	@echo "help             Show available commands"
	@echo "load_data        Load test json fixtures"

run_dev:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) runserver

superuser:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) createsuperuser

migrate:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) migrate

makemigrations:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) makemigrations api

load_data:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) load_json_data

reset_db:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) flush --no-input
		cd $(PROJECT_DIR) && $(DJANGO_RUN) migrate

run_react:
		cd $(REACT_DIR) && npm run dev

run_test:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) test front.tests

run_fullstack:
		(cd $(PROJECT_DIR) && $(DJANGO_RUN) runserver) & (cd $(REACT_DIR) && npm run dev)

static:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) collectstatic

dump:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) dumpdata --format xml -o fixtures.xml --indent 2 --exclude=auth --exclude=contenttypes --exclude=sessions

loaddata_django:
		cd $(PROJECT_DIR) && $(DJANGO_RUN) loaddata fixtures.json

		
