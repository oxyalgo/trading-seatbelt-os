FROM node:20-alpine

WORKDIR /app

# Install only production deps for a small, reproducible image.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the rest of the app.
COPY . .

# Runs whichever bots have tokens set; no-ops cleanly if none are configured.
CMD ["npm", "start"]
