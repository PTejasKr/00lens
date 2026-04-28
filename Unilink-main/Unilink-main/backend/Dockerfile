# Use Node 20 as base
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose port
EXPOSE 5001

# Start server
CMD ["node", "server.js"]