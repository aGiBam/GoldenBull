FROM node:20-slim

WORKDIR /usr/src/app

# Install deps first (better layer caching). The * makes package-lock.json
# optional so the build doesn't fail if it isn't committed to the repo.
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the backend source
COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
