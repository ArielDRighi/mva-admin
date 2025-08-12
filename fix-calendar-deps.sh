#!/bin/bash

# Eliminar el calendario antiguo
rm -f /root/AR-Frontend/components/ui/calendar.tsx

# Limpiar la caché de npm
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf /root/AR-Frontend/node_modules
rm -f /root/AR-Frontend/package-lock.json

# Intentar la instalación nuevamente
cd /root/AR-Frontend
npm install --no-package-lock

echo "Proceso completado"
