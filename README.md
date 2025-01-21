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
- Contenedorización: Docker + Docker Compose

## Requisitos Previos
- Node.js 20+
- Docker y Docker Compose
- PostgreSQL 15+ (solo para desarrollo local sin Docker)

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

### Producción con Docker

1. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con las credenciales de producción
```

2. Construir e iniciar contenedores
```bash
docker-compose up -d
```

La aplicación estará disponible en http://localhost:5000

### Producción con Google Cloud

1. **Preparación**
```bash
# Instalar Google Cloud CLI
gcloud components install docker-credential-gcr
gcloud auth configure-docker
```

2. **Construir y Desplegar**
```bash
# Construir imagen
gcloud builds submit --tag gcr.io/[PROJECT_ID]/maxillaris

# Desplegar en Cloud Run
gcloud run deploy maxillaris \
  --image gcr.io/[PROJECT_ID]/maxillaris \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. **Variables de Entorno**
Configura las siguientes variables en Cloud Run:
- `DATABASE_URL`: URL de conexión a Cloud SQL
- `NODE_ENV`: "production"

Para más detalles sobre el despliegue, consulta la sección de Producción en `Presentacion.md`.


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

## Decisiones Técnicas

### Frontend
- **React + TypeScript**: Tipado estático para mejor mantenibilidad
- **Tailwind CSS**: Estilizado rápido y consistente
- **Wouter**: Alternativa ligera a React Router
- **TanStack Query**: Gestión de estado del servidor optimizada

### Backend
- **Express**: Framework web maduro y bien documentado
- **WebSocket**: Actualizaciones en tiempo real
- **gRPC**: Comunicación eficiente para estadísticas
- **PostgreSQL**: Base de datos relacional con Drizzle ORM

### Testing
- **Vitest**: Framework de testing moderno
- **Testing Library**: Pruebas centradas en el usuario
- **Supertest**: Pruebas de integración para API

## Posibles Mejoras Futuras

### Funcionalidad
- Sistema de notificaciones por email
- Etiquetas y categorías para proyectos
- Reportes y análisis avanzados
- Integración con calendarios externos

### Técnicas
- Migración a microservicios
- CI/CD automatizado
- Monitoreo y logging centralizado
- Mejora en cobertura de tests
- Soporte offline con PWA

### Seguridad
- Autenticación 2FA
- Rate limiting
- Auditoría detallada
- Backup automatizado

## Contribución
1. Crear un fork del repositorio
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia
Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.