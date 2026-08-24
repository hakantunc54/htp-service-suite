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

# Dummy DB URL für den Next.js Build-Prozess (Prerendering)
ENV DATABASE_URL="file:./dev.db"

# Schema in die temporäre Build-Datenbank pushen (für Prerendering)
RUN npx prisma db push --accept-data-loss

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start command: Apply migrations (push) and start the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
