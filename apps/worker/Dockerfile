FROM node:22.12-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY apps/worker ./apps/worker
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate && pnpm --filter @source-blendr/worker build

FROM node:22.12-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/worker/package.json ./package.json
EXPOSE 8080
CMD ["node", "dist/index.js"]
