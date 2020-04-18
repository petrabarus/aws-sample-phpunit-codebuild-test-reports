FROM php:7.3-cli

WORKDIR /app
RUN composer install
COPY . .
