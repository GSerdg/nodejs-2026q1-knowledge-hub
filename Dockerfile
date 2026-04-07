FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner

RUN apk add --no-cache curl openssl

ENV NODE_ENV=production

WORKDIR /app

RUN chown node:node /app

COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER node

RUN npm ci --omit=dev

EXPOSE 4000

CMD [ "node", "dist/main.js" ]