# ===============================
# 1. Build Stage
# ===============================
FROM node:22-alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Install dependencies based on the package-lock.json
COPY .npmrc package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# ===============================
# 2. Production Stage
# ===============================
FROM node:22-alpine AS production

# Create and set working directory
WORKDIR /usr/src/app

# Copy only necessary files from build stage
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Run as non-root user for security
USER node

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
