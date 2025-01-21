# Maxillaris - Sistema de Gestión de Proyectos

## Descripción
Sistema de gestión de proyectos y tareas desarrollado para Maxillaris. La aplicación permite gestionar proyectos, tareas y estadísticas en tiempo real.

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
- PostgreSQL (solo para desarrollo local sin Docker)

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

## Pruebas
```bash
# Ejecutar todas las pruebas
npm run test

# Ejecutar pruebas con coverage
npm run test:coverage

# Ejecutar pruebas en modo watch
npm run test:watch
```

## Decisiones Técnicas

### Frontend
- **React + TypeScript**: Tipado estático para mejor mantenibilidad y menos errores
- **Tailwind CSS**: Estilizado rápido y consistente con utilidades predefinidas
- **Wouter**: Alternativa ligera a React Router con API similar
- **TanStack Query**: Gestión de estado del servidor y cache optimizada

### Backend
- **Express**: Framework web maduro y bien documentado
- **WebSocket**: Actualizaciones en tiempo real para tareas y proyectos
- **gRPC**: Comunicación eficiente entre servicios para estadísticas
- **PostgreSQL**: Base de datos relacional robusta con Drizzle ORM

### Testing
- **Vitest**: Framework de testing moderno compatible con Vite
- **Testing Library**: Pruebas centradas en el comportamiento del usuario
- **Supertest**: Pruebas de integración para API REST

## Posibles Mejoras Futuras

### Funcionalidad
- Implementar sistema de notificaciones por email
- Añadir soporte para etiquetas y categorías
- Agregar reportes y análisis avanzados
- Implementar integración con calendarios

### Técnicas
- Migrar a una arquitectura de microservicios
- Implementar CI/CD automatizado
- Agregar monitoreo y logging centralizado
- Mejorar cobertura de pruebas
- Implementar PWA para soporte offline

### Seguridad
- Implementar autenticación 2FA
- Agregar rate limiting
- Mejorar auditoría de cambios
- Implementar backup automatizado

## Contribución
1. Crear un fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia
Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.