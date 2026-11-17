# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of backend application code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
