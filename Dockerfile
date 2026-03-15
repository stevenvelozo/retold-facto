# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY .quackage.json ./
COPY source/ source/
COPY bin/ bin/
COPY test/model/ test/model/
# Build the Pict web app bundle
RUN npx quack build
# Copy pict.min.js into the web folder for offline serving
RUN cp node_modules/pict/dist/pict.min.js source/services/web-app/web/pict.min.js 2>/dev/null || true

# Stage 2: Runtime
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/source/ source/
COPY --from=builder /app/bin/ bin/
COPY --from=builder /app/test/model/ test/model/

EXPOSE 8386

CMD ["node", "bin/retold-facto.js", "serve"]
