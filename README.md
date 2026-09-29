# Servicio de donaciones · Fundación Huahuacuna

Servicio backend en NestJS y TypeScript para el proyecto Fundación Huahuacuna. El código está organizado por módulos de donaciones, correo, generación de Excel y PDF, e integración PSE.

## Tecnologías

NestJS, TypeScript, Prisma y pnpm.

## Estructura

El proyecto está en [`donaciones-service-huahuacuna-master/donaciones-service-huahuacuna-master`](donaciones-service-huahuacuna-master/donaciones-service-huahuacuna-master). Los módulos de negocio se encuentran en `src/modules`; también hay carpetas de configuración, base de datos y pruebas.

## Desarrollo local

Dentro de la carpeta del proyecto:

```bash
pnpm install
pnpm run prisma:generate
pnpm run start:dev
```

Configura antes las variables de entorno y los servicios externos que requiera tu instalación. Este repositorio contiene el código del servicio; no incluye un despliegue público de demostración.

## Proyecto relacionado

- [Aplicación web Huahuacuna](https://github.com/Kamilogallego/Huahuacuna-Code)
- [Servicio de autenticación](https://github.com/Kamilogallego/client)
