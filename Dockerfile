FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

EXPOSE 3000

# Start NestJS in dev mode with hot-reload
CMD ["npm", "run", "start:dev"]
