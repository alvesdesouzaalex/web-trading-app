# ==========================================
# Stage 1 - Build Angular Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Build Angular application
RUN npm run build


# ==========================================
# Stage 2 - Serve Application
# ==========================================
FROM nginx:alpine

# Copy Angular build
COPY --from=build /app/dist/web-trading-app/browser /usr/share/nginx/html

# Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]