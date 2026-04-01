FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Run database seed on first start (optional)
# RUN npm run seed

# Start server
CMD ["npm", "start"]
