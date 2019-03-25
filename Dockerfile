FROM gkutiel/html2apk-base

COPY index.js .
COPY s .

EXPOSE 8080
CMD ["node","index.js"]