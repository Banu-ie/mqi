# The image serves the API and the built React app from one process, so it needs
# both halves of the repository. Build it from the REPOSITORY ROOT:
#
#   docker build -f backend/Dockerfile -t mqicma .
#
# ---- build stage -------------------------------------------------------------
# `pg` is pure JavaScript, so no native toolchain is needed.
FROM node:22-slim AS build
WORKDIR /app

# Dependencies first, so edits to source do not invalidate the install layers.
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm --prefix frontend ci
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm --prefix backend ci

COPY frontend ./frontend
COPY backend ./backend

# Compile the backend, build the frontend, and place the frontend where the
# server looks for it (backend/public). Then drop dev dependencies so only
# runtime deps are carried into the final image.
RUN npm --prefix backend run build:all \
 && npm --prefix backend ci --omit=dev

# ---- runtime stage -----------------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV TRUST_PROXY=true

# Durable state lives in managed PostgreSQL. The one exception is backend/uploads:
# mount a volume there if admin-uploaded images must survive a redeploy.
# DATABASE_URL and JWT_SECRET are injected at runtime, never baked into the image.
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/public ./public
COPY --from=build /app/backend/package.json ./package.json

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Migrations run at startup, before the port opens.
CMD ["node", "dist/index.js"]
