FROM node:21-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile
COPY . .
RUN npx prisma generate && pnpm build && pnpm i --prod

FROM node:21-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder app/dist ./dist
COPY --from=builder app/node_modules ./node_modules
COPY entrypoint.sh ./
COPY prisma ./prisma
RUN chmod +x entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]