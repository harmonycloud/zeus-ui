FROM nginx:1.21.0
ADD build /usr/share/nginx/html/
EXPOSE 80
