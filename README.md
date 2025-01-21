# Maxillaris - Sistema de Gestión de Proyectos

## Descripción
Sistema de gestión de proyectos y tareas con capacidades en tiempo real. Permite la colaboración efectiva entre equipos mediante actualizaciones instantáneas, métricas en tiempo real y una interfaz intuitiva.

## Características Principales
- Gestión de proyectos y tareas
- Actualizaciones en tiempo real vía WebSocket
- Estadísticas y métricas con gRPC
- Autenticación y autorización de usuarios
- Interfaz responsive y moderna
- Soporte para temas claro/oscuro

## Tecnologías Principales
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: PostgreSQL
- Comunicación en tiempo real: WebSocket + gRPC
- Testing: Vitest + Testing Library

## Requisitos Previos
- Node.js 20+
- PostgreSQL 15+
- Google Cloud CLI (para despliegue en GCP)

## Instalación y Ejecución

### Desarrollo Local
1. Clonar el repositorio
```bash
git clone <repository-url>
cd maxillaris
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar la aplicación
```bash
npm run dev
```

### Despliegue en Google Cloud

1. **Preparar el Entorno**
```bash
# Instalar Google Cloud CLI
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-VERSION-linux-x86_64.tar.gz
tar -xf google-cloud-cli-*.tar.gz
./google-cloud-sdk/install.sh

# Iniciar sesión en Google Cloud
gcloud auth login

# Configurar el proyecto
gcloud config set project [PROJECT_ID]

# Habilitar las APIs necesarias
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com
```

2. **Configurar Base de Datos**
```bash
# Crear instancia de Cloud SQL (PostgreSQL)
gcloud sql instances create maxillaris-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=[YOUR_PASSWORD]

# Crear base de datos
gcloud sql databases create maxillaris \
  --instance=maxillaris-db
```

3. **Configurar Secretos**
```bash
# Crear secretos para variables de entorno
echo -n "[DATABASE_URL]" | \
  gcloud secrets create DATABASE_URL --data-file=-

echo -n "[JWT_SECRET]" | \
  gcloud secrets create JWT_SECRET --data-file=-
```

4. **Desplegar la Aplicación**
```bash
# Construir y subir la imagen
gcloud builds submit --tag gcr.io/[PROJECT_ID]/maxillaris

# Desplegar en Cloud Run
gcloud run deploy maxillaris \
  --image gcr.io/[PROJECT_ID]/maxillaris \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --set-secrets JWT_SECRET=JWT_SECRET:latest \
  --set-env-vars "NODE_ENV=production"
```

5. **Configurar Dominio (Opcional)**
```bash
# Mapear dominio personalizado
gcloud run domain-mappings create \
  --service maxillaris \
  --domain [YOUR_DOMAIN] \
  --region us-central1
```

6. **Verificar Despliegue**
```bash
# Obtener URL del servicio
gcloud run services describe maxillaris \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

## Desarrollo

### Estructura del Proyecto
```
├── client/           # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── pages/
├── server/           # Backend Express
│   ├── grpc/
│   ├── routes/
│   └── websocket/
├── db/              # Esquemas y migraciones
└── proto/           # Definiciones gRPC
```

### Comandos Útiles
```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run db:push      # Actualiza esquema de base de datos

# Testing
npm run test         # Ejecuta tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Reporte de cobertura

# Producción
npm run build        # Construye para producción
npm run start        # Inicia en modo producción
```

## Licencia
Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.