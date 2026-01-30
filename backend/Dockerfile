FROM node:22-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Create database directory
RUN mkdir -p /app/database

EXPOSE 3001

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
