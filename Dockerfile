FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

RUN chown node:node /app

COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist

USER node

RUN npm ci --omit=dev

EXPOSE 4000

CMD [ "node", "dist/main.js" ]