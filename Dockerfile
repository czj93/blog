FROM nginx:lastest

WORKDIR /usr/share/nginx/html
COPY deploy/default.conf /etc/nginx/conf.d/
COPY docs/.vuepress/dist/ /usr/share/nginx/html
EXPOSE 80
