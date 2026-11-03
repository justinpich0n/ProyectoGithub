FROM node:24-bookworm-slim AS interfaz
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_BASE_URL=/api
RUN npm run build

FROM node:24-bookworm-slim AS aplicacion
ENV NODE_ENV=production SERVE_FRONTEND=true HOST=0.0.0.0
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node backend/ ./
COPY --from=interfaz --chown=node:node /build/frontend/dist /app/frontend/dist
USER node
EXPOSE 3000
CMD ["node", "server.js"]
