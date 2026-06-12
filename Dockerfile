FROM nginx:alpine

COPY index.html og-image.png robots.txt sitemap.xml /usr/share/nginx/html/

EXPOSE 80
