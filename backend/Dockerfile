# Base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose backend server port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
