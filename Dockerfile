# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Instalar todas las dependencias, incluyendo devDependencies
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar archivos necesarios del stage de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/proto ./proto

# Variables de entorno por defecto
ENV NODE_ENV=production

# El puerto se configurará automáticamente por Cloud Run
EXPOSE 8080

# Healthcheck para asegurar que la aplicación está funcionando
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/ || exit 1

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]