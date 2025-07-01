# Uses the official Nginx image
FROM nginx:alpine

# Copies frontend app files (e.g., index.html, style.css into the directory where Nginx serves static files: → /usr/share/nginx/html
COPY . /usr/share/nginx/html


#  this container will listen on port 80, the default HTTP port used by Nginx.
EXPOSE 80
