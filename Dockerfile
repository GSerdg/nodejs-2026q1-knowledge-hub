FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

RUN npm prune --production

FROM node:24-alpine AS runner

RUN apk add --no-cache curl openssl

ENV NODE_ENV=production

WORKDIR /app


COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R node:node /app
USER node

EXPOSE 4000

CMD [ "npm", "run", "start:prod" ]