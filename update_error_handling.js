import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para actualizar un archivo de acciones
function updateActionFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);

    console.log(`Actualizando ${fileName}...`);

    // Patrones para buscar y reemplazar
    const patterns = [
      // Patrón para handleApiResponse sin contexto
      {
        search: /handleApiResponse\(([^,]+),\s*"([^"]+)"\)/g,
        replace: (match, response, errorMsg) => {
          const endpoint = extractEndpoint(content);
          const method = extractMethod(content);
          return `handleApiResponse(${response}, "${errorMsg}", {
      file: "${fileName}",
      endpoint: "${endpoint}",
      method: "${method}"
    })`;
        },
      },

      // Patrón para createServerAction sin contexto
      {
        search:
          /createServerAction\(\s*async\s*\([^)]*\)\s*=>\s*{[\s\S]*?},\s*"([^"]+)"\s*\)/g,
        replace: (match, errorMsg) => {
          const endpoint = extractEndpoint(match);
          const method = extractMethod(match);
          return match.replace(
            `"${errorMsg}")`,
            `"${errorMsg}", {
    file: "${fileName}",
    endpoint: "${endpoint}",
    method: "${method}"
  })`
          );
        },
      },
    ];

    // Aplicar las transformaciones
    patterns.forEach((pattern) => {
      content = content.replace(pattern.search, pattern.replace);
    });

    // Escribir el archivo actualizado
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ ${fileName} actualizado correctamente`);
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
  }
}

// Función para extraer el endpoint de una llamada fetch
function extractEndpoint(content) {
  // Buscar patterns comunes de endpoints
  const urlPatterns = [
    /`\${[^}]+}\/api\/([^`\s]+)`/,
    /"[^"]*\/api\/([^"]+)"/,
    /\/api\/([^"'`\s]+)/,
  ];

  for (const pattern of urlPatterns) {
    const urlMatch = content.match(pattern);
    if (urlMatch) {
      return `/api/${urlMatch[1]}`;
    }
  }

  return "/api/unknown";
}

// Función para extraer el método HTTP
function extractMethod(content) {
  if (
    content.includes('method: "POST"') ||
    content.includes("method: 'POST'")
  ) {
    return "POST";
  } else if (
    content.includes('method: "PUT"') ||
    content.includes("method: 'PUT'")
  ) {
    return "PUT";
  } else if (
    content.includes('method: "DELETE"') ||
    content.includes("method: 'DELETE'")
  ) {
    return "DELETE";
  } else if (
    content.includes('method: "PATCH"') ||
    content.includes("method: 'PATCH'")
  ) {
    return "PATCH";
  }
  return "GET";
}

// Función principal
function main() {
  const actionsDir = path.join(__dirname, "app", "actions");

  if (!fs.existsSync(actionsDir)) {
    console.error("❌ Directorio de acciones no encontrado:", actionsDir);
    return;
  }

  const files = fs
    .readdirSync(actionsDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.join(actionsDir, file));

  console.log(
    `📁 Encontrados ${files.length} archivos de acciones para actualizar...\n`
  );

  files.forEach(updateActionFile);

  console.log("\n🎉 Actualización completada!");
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateActionFile, extractEndpoint, extractMethod };
