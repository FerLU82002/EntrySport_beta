#!/bin/bash

# Script de instalación de Docker y despliegue de servicios
# Autor: Auto-generado
# Fecha: $(date +%Y-%m-%d)

set -e  # Detener el script si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar si el script se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Este script debe ejecutarse como root o con sudo"
    exit 1
fi

print_message "=== Iniciando instalación de Docker ==="

# 1. Configurar repositorio de Docker
print_message "Configurando repositorio de Docker..."

# Actualizar índice de paquetes
print_message "Actualizando paquetes del sistema..."
apt-get update

# Instalar prerequisitos
print_message "Instalando certificados y curl..."
apt-get install -y ca-certificates curl

# Crear directorio para keyrings
print_message "Creando directorio para keyrings..."
install -m 0755 -d /etc/apt/keyrings

# Descargar GPG key de Docker
print_message "Descargando GPG key de Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

# Dar permisos de lectura
chmod a+r /etc/apt/keyrings/docker.asc

# Agregar repositorio a sources
print_message "Agregando repositorio de Docker a sources..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar índice de paquetes nuevamente
print_message "Actualizando índice de paquetes..."
apt-get update

# 2. Instalar Docker
print_message "Instalando paquetes de Docker..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalación
print_message "Verificando instalación de Docker..."
docker --version
docker compose version

print_message "=== Docker instalado correctamente ==="

# 3. Obtener certificados SSL
print_message "=== Obteniendo certificados SSL con Certbot ==="

if [ ! -f "compose.cert.yml" ]; then
    print_error "No se encontró el archivo compose.cert.yml"
    exit 1
fi

print_message "Levantando servicio de certificación..."
docker compose -f compose.cert.yml up -d

print_message "Esperando 30 segundos para que se generen los certificados..."
sleep 30

print_message "Deteniendo servicio de certificación..."
docker compose -f compose.cert.yml down

print_message "=== Certificados obtenidos ==="

# 4. Levantar servicios de producción
print_message "=== Levantando servicios de producción ==="

if [ ! -f "compose.prod.yml" ]; then
    print_error "No se encontró el archivo compose.prod.yml"
    exit 1
fi

print_message "Iniciando servicios de producción..."
docker compose -f compose.prod.yml up -d

# Verificar estado de los contenedores
print_message "Estado de los contenedores:"
docker compose -f compose.prod.yml ps

print_message "=== Instalación y despliegue completados ==="
print_message "Servicios corriendo en producción"