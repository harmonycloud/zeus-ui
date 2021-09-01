FROM nginx:1.17.8
ADD build /usr/share/nginx/html/
EXPOSE 80
