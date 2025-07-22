FROM node:24-slim

ARG VERSION=0.0.0

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ curl net-tools && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npx nuxt build

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production
ENV NODE_PATH=/app/node_modules
ENV APP_VERSION=${VERSION}
ENV PUID=1000
ENV PGID=1000

RUN mkdir -p data && chown -R ${PUID}:${PGID} data && chown -R ${PUID}:${PGID} /app && chmod 755 /app data

EXPOSE 3000

USER ${PUID}:${PGID}

CMD ["node", ".output/server/index.mjs"]
