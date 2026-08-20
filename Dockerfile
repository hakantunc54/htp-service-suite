FROM node:20-alpine

# Set timezone
ENV TZ=Europe/Berlin
RUN apk add --no-cache tzdata

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start command: Apply migrations (push) and start the server
CMD ["sh", "-c", "npx prisma db push && npm start"]
