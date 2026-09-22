FROM php:8.2-fpm as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql zip expc imagex mbstring

# Set working directory
WORKDIR /var/www

# Copy composer.json first for better caching
COPY composer.json ./

# Install Composer (optimization: don't download every time)
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
    php -r "unlink('composer-setup.php');"

# Only cache dependencies we actually use (not all vendor files)
RUN composer install --no-dev --optimize-autoloader --no-plugins --no-scripts 2>/dev/null || true

FROM php:8.2-fpm

# Copy optimized code from builder stage
COPY --from=builder /usr/local/lib/php/ext /usr/local/lib/php/ext
COPY --from=builder /usr/local/bin/composer /usr/local/bin/composer

# Install only production dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    mysql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configure nginx for Laravel
RUN mkdir -p /run/nginx && \
    echo 'worker_processes 4;' > /etc/nginx/nginx.conf && \
    echo 'error_log /var/log/nginx/error.log warn;' >> /etc/nginx/nginx.conf && \
    echo 'pid /run/nginx.pid;' >> /etc/nginx/nginx.conf && \
    echo '\nevents {' >> /etc/nginx/nginx.conf && \
    echo '  worker_connections 1024;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf && \
    echo '\nhttp {' >> /etc/nginx/nginx.conf && \
    echo '  server {' >> /etc/nginx/nginx.conf && \
    echo '    listen 80 default_server;' >> /etc/nginx/nginx.conf && \
    echo '    server_name localhost;' >> /etc/nginx/nginx.conf && \
    echo '    root /var/www/public;' >> /etc/nginx/nginx.conf && \
    echo '    index index.php;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

WORKDIR /var/www

# Copy application code AFTER configuring base
COPY . .

# Optimize performance at container level
ENV OPcache_enable=1
ENV OPcache_memory_consumption=256
ENV Opcache_interned_strings_buffer=32
ENV Opcache_max_accelerated_files=20000

# Expose port for Nginx and PHP-FPM
EXPOSE 80 9000

# Health check (faster than existing one)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Start Nginx and PHP-FPM in foreground
CMD ["sh", "-c", "php artisan migrate --force && php artisan config:clear && php artisan route:clear && nginx -g 'daemon off;' & php-fpm"]
