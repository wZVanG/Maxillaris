# Despliegue en Google Cloud Run

Este documento describe el proceso para desplegar Maxillaris en Google Cloud Run utilizando GitHub Actions.

## Prerrequisitos

1. Cuenta de Google Cloud Platform
2. Proyecto creado en GCP
3. Repositorio en GitHub
4. Credenciales de servicio GCP

## Pasos de Configuración

### 1. Configurar Google Cloud

1. Instalar y configurar Google Cloud CLI:
```bash
gcloud init
gcloud auth configure-docker
```

2. Crear cuenta de servicio:
```bash
# Crear cuenta de servicio
gcloud iam service-accounts create maxillaris-deploy

# Asignar roles necesarios
gcloud projects add-iam-policy-binding [PROJECT_ID] \
    --member="serviceAccount:maxillaris-deploy@[PROJECT_ID].iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding [PROJECT_ID] \
    --member="serviceAccount:maxillaris-deploy@[PROJECT_ID].iam.gserviceaccount.com" \
    --role="roles/storage.admin"
```

3. Generar y descargar la clave JSON:
```bash
gcloud iam service-accounts keys create key.json \
    --iam-account=maxillaris-deploy@[PROJECT_ID].iam.gserviceaccount.com
```

### 2. Configurar GitHub Secrets

Agregar los siguientes secrets en GitHub:
- `GCP_PROJECT_ID`: ID del proyecto de GCP
- `GCP_SA_KEY`: Contenido del archivo key.json
- `GCP_REGION`: Región de despliegue (ej: us-central1)

### 3. Archivo de Workflow

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Google Cloud Run

on:
  push:
    branches:
      - main

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: ${{ secrets.GCP_REGION }}
  SERVICE_NAME: maxillaris-app

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}

    - name: Configure Docker
      run: gcloud auth configure-docker

    - name: Build Docker image
      run: |
        docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:${{ github.sha }} .
        docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:${{ github.sha }}

    - name: Deploy to Cloud Run
      uses: google-github-actions/deploy-cloudrun@v1
      with:
        service: ${{ env.SERVICE_NAME }}
        image: gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
        region: ${{ env.REGION }}
        env_vars: |
          DATABASE_URL=${{ secrets.DATABASE_URL }}
          NODE_ENV=production
```

### 4. Preparar la Aplicación

1. Asegurarse de que el Dockerfile esté optimizado para producción:

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 8080
CMD ["npm", "start"]
```

2. Configurar variables de entorno en Cloud Run:
```bash
gcloud run services update maxillaris-app \
  --set-env-vars="DATABASE_URL=postgresql://..." \
  --region=us-central1
```

## Despliegue Manual

Si necesitas hacer un despliegue manual:

1. Construir la imagen:
```bash
docker build -t gcr.io/[PROJECT_ID]/maxillaris-app .
```

2. Subir la imagen:
```bash
docker push gcr.io/[PROJECT_ID]/maxillaris-app
```

3. Desplegar en Cloud Run:
```bash
gcloud run deploy maxillaris-app \
  --image gcr.io/[PROJECT_ID]/maxillaris-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Verificación

1. Obtener la URL del servicio:
```bash
gcloud run services describe maxillaris-app \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

2. Verificar los logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=maxillaris-app" --limit 50
```

## Monitoreo y Mantenimiento

1. Configurar alertas en Google Cloud Monitoring
2. Revisar métricas de rendimiento en Cloud Run dashboard
3. Configurar Cloud Trace para monitoreo de latencia

## Optimizaciones Recomendadas

1. Configurar Cloud CDN para assets estáticos
2. Implementar Cloud Armor para seguridad
3. Utilizar Cloud SQL Proxy para conexiones seguras a la base de datos
4. Configurar dominios personalizados con SSL

## Troubleshooting

1. Revisar logs de construcción:
```bash
gcloud builds log [BUILD_ID]
```

2. Verificar configuración:
```bash
gcloud run services describe maxillaris-app
```

3. Problemas comunes:
   - Errores de memoria: Ajustar límites de recursos
   - Problemas de conexión: Verificar configuración de red/VPC
   - Errores de base de datos: Verificar conexión y credenciales

## Referencias

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Container Runtime Contract](https://cloud.google.com/run/docs/reference/container-contract)
