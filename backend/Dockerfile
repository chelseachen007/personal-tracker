FROM node:22-alpine

# Install wget and openssl for Prisma
RUN apk add --no-cache wget openssl

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
