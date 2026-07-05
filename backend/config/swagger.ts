import path from 'node:path'
import url from 'node:url'

/**
 * Configuración de adonis-autoswagger.
 *
 * Genera la especificación OpenAPI a partir de `start/routes.ts`, los modelos
 * de `app/models/*` y las anotaciones JSDoc de los controllers. Se sirve en
 * `/openapi` (documento OpenAPI) y se renderiza con Scalar en `/docs`.
 */
export default {
  // Raíz del proyecto (AdonisJS 6/7): permite a la librería localizar
  // controllers y modelos para escanear rutas y schemas.
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',

  title: 'FlowSync API',
  version: '1.0.0',
  description:
    'API JSON de FlowSync (starter kit AI4Devs): autenticación por access tokens ' +
    '(oat_*) sobre AdonisJS 7 + Lucid + SQLite. Todos los endpoints cuelgan del ' +
    'prefijo /api/v1.',

  // Índice del segmento de la ruta usado como tag (agrupación por recurso).
  // Las rutas son "/api/v1/<recurso>/...", así que al hacer split("/") el
  // recurso (account, users, health) queda en el índice 3:
  //   ["", "api", "v1", "account", "register"]
  //     0     1     2       3          4
  tagIndex: 3,

  snakeCase: true,
  debug: false,

  // No documentar las rutas de infraestructura de la propia doc ni el root.
  ignore: ['/openapi', '/docs', '/'],

  preferredPutPatch: 'PUT',

  common: {
    parameters: {},
    headers: {},
  },

  // Esquema de seguridad: Bearer con access tokens oat_*.
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'oat',
      description:
        'Access token con prefijo oat_* devuelto por POST /account/login o ' +
        'POST /account/register. Enviar en la cabecera: Authorization: Bearer oat_xxx',
    },
  },

  // Middlewares de Adonis que marcan una ruta como protegida.
  authMiddlewares: ['auth', 'auth:api'],

  // Esquema aplicado por defecto a las rutas protegidas.
  defaultSecurityScheme: 'bearerAuth',

  persistAuthorization: true,
  showFullPath: false,
}
