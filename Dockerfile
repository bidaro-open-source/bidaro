ARG BUN_VERSION=1.3.3
ARG NODE_VERSION=22.21.1
ARG IMAGE=imbios/bun-node:${BUN_VERSION}-${NODE_VERSION}-alpine

FROM --platform=linux/amd64 $IMAGE AS base
WORKDIR /usr/src/app

# Installing Dependencies
FROM base AS install
COPY . .
RUN apk --no-cache --update add git python3 make g++\
   && rm -rf /var/cache/apk/*
RUN bun install --frozen-lockfile --production
ENV NODE_ENV=production
RUN bun run build

# Production
FROM base AS release
COPY --chown=bun:bun --from=install /usr/src/app/node_modules node_modules
COPY --chown=bun:bun --from=install /usr/src/app/.output .
COPY --chown=bun:bun --from=install /usr/src/app/instrumentation.ts .

USER bun
ENV HOST 0.0.0.0
EXPOSE 3000
ENTRYPOINT [ "bun", "-r", "./instrumentation.ts", "server/index.mjs" ]
