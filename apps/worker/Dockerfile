FROM node:22.12-alpine AS build
RUN npm install --global pnpm@10.13.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY apps/worker ./apps/worker
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate && pnpm --filter @source-blendr/worker build

FROM mcr.microsoft.com/playwright:v1.55.1-noble
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/worker/dist ./apps/worker/dist
COPY --from=build /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=build /app/apps/worker/package.json ./apps/worker/package.json
EXPOSE 8080
CMD ["node", "apps/worker/dist/index.js"]
