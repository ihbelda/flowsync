import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
// eslint-disable-next-line @typescript-eslint/naming-convention
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

const NewAccountsController = () => import('#controllers/new_accounts_controller')
const AccessTokensController = () => import('#controllers/access_tokens_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const HealthController = () => import('#controllers/health_controller')
const UsersController = () => import('#controllers/users_controller')

router.get('/', async () => {
  return { app: 'full-stack-adonisjs-master', status: 'running' }
})

/*
|--------------------------------------------------------------------------
| Documentación de la API (OpenAPI + Scalar)
|--------------------------------------------------------------------------
| /openapi → documento OpenAPI generado por adonis-autoswagger.
| /docs    → UI de Scalar que consume /openapi.
| Fuera del grupo con auth: la documentación es pública.
*/
router.get('/openapi', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.scalar('/openapi')
})

/*
|--------------------------------------------------------------------------
| API v1
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    // Health (creado en S2 vía OpenSpec)
    router.get('/health', [HealthController, 'index'])

    // Cuenta / autenticación
    router.post('/account/register', [NewAccountsController, 'store'])
    router.post('/account/login', [AccessTokensController, 'store'])

    // Rutas protegidas (requieren Bearer token)
    router
      .group(() => {
        router.post('/account/logout', [AccessTokensController, 'destroy'])
        router.get('/account/profile', [ProfilesController, 'show'])

        router.get('/users', [UsersController, 'index'])
        router.get('/users/active', [UsersController, 'active'])
        router.get('/users/:id', [UsersController, 'show'])
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')
