# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Reduce picos de memoria en hosts pequeños (ej. t2/t3 micro)
ENV NODE_OPTIONS=--max-old-space-size=768

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile --child-concurrency=1 --no-optional \
  && pnpm store prune

# Copiar código fuente
COPY . .

# Construir aplicación
RUN pnpm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar node_modules y build desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Iniciar aplicación
CMD ["pnpm", "start"]
