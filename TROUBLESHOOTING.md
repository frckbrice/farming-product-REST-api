# Troubleshooting Guide

This file records important problems encountered in the project and how they were solved. Add new entries as needed.

---

## Docker Compose: App can't connect to Postgres
- **Symptom:** App fails to connect to the database when running with Docker Compose.
- **Solution:** Ensure the `DB_HOST`/`PROD_DB_HOSTNAME` is set to `db` in your environment. The `depends_on` field in `docker-compose.yml` ensures the database starts first, but you may need to add a wait-for-it script for production reliability.

## Prettier Pre-push Hook Not Running
- **Symptom:** Code is not formatted before push.
- **Solution:** Make sure Husky is installed and `.husky/pre-push` is executable. Run `yarn husky install` if needed.

## Zod Validation Errors
- **Symptom:** API returns 400 with `errors` object.
- **Solution:** Check the error details in the response. Update your request body to match the required schema (see Swagger docs for examples).

## Swagger UI Not Updating
- **Symptom:** Changes to Swagger docs are not reflected at `/api-docs`.
- **Solution:** Restart the server after making changes to route files or Swagger comments. Swagger UI reads docs at startup.

---

Add more issues and solutions as you encounter them! 