# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0
ARG PNPM_VERSION=10.10.0

################################################################################
# Base image
################################################################################
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

# Instalar pnpm
RUN --mount=type=cache,target=/root/.npm \
  npm install -g pnpm@${PNPM_VERSION}

################################################################################
# Dependencies stage
################################################################################
FROM base AS deps

# Copiar archivos necesarios
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias de producción
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --prod --frozen-lockfile

################################################################################
# Build stage
################################################################################
FROM base AS build

# Variables de entorno para Next.js
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_CULQI_PUBLIC_KEY
ARG NEXT_PUBLIC_CULQI_ORDER_ID
ARG NEXT_PUBLIC_CULQI_RSA_ID
ARG NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY
ARG NEXT_PUBLIC_CULQI_TITLE

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_CULQI_PUBLIC_KEY=$NEXT_PUBLIC_CULQI_PUBLIC_KEY
ENV NEXT_PUBLIC_CULQI_ORDER_ID=$NEXT_PUBLIC_CULQI_ORDER_ID
ENV NEXT_PUBLIC_CULQI_RSA_ID=$NEXT_PUBLIC_CULQI_RSA_ID
ENV NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY=$NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY
ENV NEXT_PUBLIC_CULQI_TITLE=$NEXT_PUBLIC_CULQI_TITLE

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS las dependencias
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build de Next.js
RUN pnpm run build

################################################################################
# Final stage
################################################################################
FROM base AS final

WORKDIR /app

ENV NODE_ENV=production

# Copiar archivos necesarios
COPY --from=build /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# Si tienes next.config.js o next.config.mjs
COPY --from=build /app/next.config.* ./

# Dar permisos al usuario node
RUN chown -R node:node /app

# Usar usuario no root
USER node

# Puerto de Next.js
EXPOSE 3000

# Iniciar aplicación
CMD ["pnpm", "start"]