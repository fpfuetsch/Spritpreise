ARG NODE_IMAGE=node:24.18-alpine

FROM ${NODE_IMAGE} AS builder

WORKDIR /usr/src/app

# Copy dependency manifests first to maximize layer cache hits.
COPY package*.json ./
RUN npm ci

# Copy only files required for compilation.
COPY tsconfig.json webpack.config.js ./
COPY src ./src

RUN npm run build

FROM ${NODE_IMAGE} AS runtime

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install production dependencies only.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder stage.
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 80
CMD ["node", "dist/server.js"]
