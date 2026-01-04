# Stage 1: Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist/web-trading-app/browser /usr/share/nginx/html
# Copy custom nginx config if needed, otherwise default is fine for simple SPA (needs fallback for routing though)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
