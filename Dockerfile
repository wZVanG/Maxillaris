# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependencias
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
COPY --from=builder /app/proto ./proto

# Instalar solo dependencias de producción
RUN npm ci --production

# Exponer puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]