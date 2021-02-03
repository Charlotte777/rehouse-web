FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf

ADD data-heytea-com.tar.gz /usr/share/nginx/html/
