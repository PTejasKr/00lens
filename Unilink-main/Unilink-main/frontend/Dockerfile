# Stage 1: Build
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Ensure we use the production API URL during build if needed, 
# but usually it's handled via VITE_ env vars at build time.
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy a custom nginx config if you have one, or use default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
