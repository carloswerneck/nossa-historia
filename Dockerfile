FROM node:22-alpine

WORKDIR /app
COPY server.js index.html og-image.png robots.txt sitemap.xml google82036a0e3ac7582a.html ./

ENV PORT=80
ENV DATA_DIR=/data
VOLUME /data

EXPOSE 80
CMD ["node", "server.js"]
