# ---- build stage -------------------------------------------------------------
# `pg` is pure JavaScript, so no native toolchain is needed.
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Reinstall without dev dependencies so only runtime deps are copied forward.
RUN npm ci --omit=dev

# ---- runtime stage -----------------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV TRUST_PROXY=true

# State lives in managed PostgreSQL, so this image is stateless — no volume,
# and a redeploy cannot lose data. DATABASE_URL and JWT_SECRET are injected at
# runtime and are never baked into the image.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Migrations run at startup, before the port opens.
CMD ["node", "dist/index.js"]
