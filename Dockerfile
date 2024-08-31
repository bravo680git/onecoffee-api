FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm
RUN pnpm i --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN pnpm build
RUN pnpm i -P

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder app/dist ./dist
COPY --from=builder app/node_modules ./node_modules
COPY entrypoint.sh ./
COPY prisma ./prisma
RUN chmod +x entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]