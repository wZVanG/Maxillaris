# Maxillaris - Sistema de Gestión de Proyectos

Sistema de gestión de proyectos y tareas con arquitectura de microservicios, diseñado para optimizar el flujo de trabajo y la productividad del equipo.

![Logo Maxillaris](client/public/m_logo_light.png)

## Características Principales

- 🔐 Autenticación de usuarios
- 📊 Panel de control con estadísticas en tiempo real
- 📱 Diseño responsive y mobile-first
- 🌙 Tema claro/oscuro personalizado
- 🔄 Actualizaciones en tiempo real con WebSocket
- 📈 Microservicio de estadísticas con gRPC
- 🌐 Internacionalización
- ✨ UI moderna con Tailwind CSS y shadcn/ui

## Stack Tecnológico

### Frontend
- React + TypeScript
- Wouter para routing
- TanStack Query para estado y caché
- Tailwind CSS + shadcn/ui para diseño
- WebSocket para actualizaciones en tiempo real

### Backend
- Express.js con TypeScript
- gRPC para el servicio de estadísticas
- WebSocket para notificaciones
- PostgreSQL con Drizzle ORM
- Passport.js para autenticación

## Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- Docker (opcional)

## Configuración Local

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/maxillaris-project.git
cd maxillaris-project
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar la base de datos:
```bash
npm run db:push
```

5. Iniciar en modo desarrollo:
```bash
npm run dev
```

## Despliegue con Docker

1. Construir la imagen:
```bash
docker build -t maxillaris-app .
```

2. Ejecutar el contenedor:
```bash
docker-compose up -d
```

## Estructura del Proyecto

```
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── hooks/      # Hooks personalizados
│   │   ├── pages/      # Páginas de la aplicación
│   │   └── lib/        # Utilidades
├── server/             # Backend Express
│   ├── grpc/          # Servicios gRPC
│   └── routes/        # Rutas API
├── db/                # Modelos y migraciones
└── proto/            # Definiciones Protocol Buffers
```

## Testing

El proyecto incluye pruebas unitarias tanto para el frontend como para el backend:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con coverage
npm run test:coverage
```

## Decisiones Técnicas

1. **Wouter vs React Router**
   - Más ligero (1.5kB vs 42kB)
   - API similar a React Router
   - Mejor rendimiento en aplicaciones pequeñas/medianas

2. **gRPC para Estadísticas**
   - Mejor rendimiento que REST para llamadas frecuentes
   - Contratos bien definidos con Protocol Buffers
   - Streaming bidireccional para actualizaciones en tiempo real

3. **Drizzle ORM**
   - Type-safety con TypeScript
   - Mejor rendimiento que TypeORM/Prisma
   - Migraciones más simples y seguras

4. **shadcn/ui + Tailwind**
   - Componentes accesibles y personalizables
   - No hay overhead de bundle size
   - Fácil personalización de tema

## Mejoras Futuras

1. **Rendimiento**
   - Implementar SSR con Vite
   - Lazy loading de componentes grandes
   - Optimizar carga de imágenes

2. **Seguridad**
   - Implementar 2FA
   - Rate limiting en API
   - Auditoría de acciones

3. **Funcionalidad**
   - Integración con calendario
   - Sistema de comentarios
   - Exportación de datos
   - Integración con servicios externos

4. **DevOps**
   - CI/CD automatizado
   - Monitoreo y logging
   - Backups automáticos

## Contribuir

1. Fork el repositorio
2. Crear una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -am 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Crear un Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.
