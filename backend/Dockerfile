# Use Node 18 LTS
FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy only package files first for better caching
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --only=production || npm install --only=production

# Copy app source
COPY . .

# Set environment defaults suitable for Cloud Run's ephemeral filesystem
ENV PORT=8080 \
    NODE_ENV=production \
    DB_PATH=/tmp/messages.db \
    UPLOAD_DIR=/tmp/uploads

# Expose Cloud Run port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]

