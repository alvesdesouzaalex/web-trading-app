# ==========================================
# Stage 1 - Build Angular Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ==========================================
# Stage 2 - Serve Application
# ==========================================
FROM nginx:alpine

# Copy Angular build
COPY --from=build \
    /app/dist/web-trading-app/browser \
    /usr/share/nginx/html

# Copy environment template directly
COPY --from=build \
    /app/src/assets/env.template.js \
    /usr/share/nginx/html/assets/env.template.js

# Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime environment script
COPY docker-entrypoint.d/40-env.sh \
    /docker-entrypoint.d/40-env.sh

RUN chmod +x /docker-entrypoint.d/40-env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]