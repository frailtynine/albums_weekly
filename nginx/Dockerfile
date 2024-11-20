FROM nginx:1.22.1
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=albums_weekly-frontend /app/dist /usr/share/nginx/html