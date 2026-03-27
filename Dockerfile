FROM node:22-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/env/package.json ./packages/env/package.json

RUN npm ci

FROM deps AS build

COPY tsconfig.json ./
COPY biome.json ./
COPY apps/server ./apps/server
COPY packages/config ./packages/config
COPY packages/db ./packages/db
COPY packages/env ./packages/env

RUN npm run build -w server
RUN npm prune --omit=dev

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/server/package.json ./apps/server/package.json
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/packages/config/package.json ./packages/config/package.json
COPY --from=build /app/packages/db/package.json ./packages/db/package.json
COPY --from=build /app/packages/env/package.json ./packages/env/package.json

EXPOSE 3000

CMD ["node", "apps/server/dist/index.mjs"]
