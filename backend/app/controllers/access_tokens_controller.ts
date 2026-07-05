import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth'
import { UserTransformer } from '#transformers/user_transformer'

  /**
   * POST /account/login
   * Verifica credenciales y emite un access token.
   */
export default class AccessTokensController {
  /**
   * @store
   * @summary Iniciar sesión
   * @description Autentica con email y contraseña y devuelve un access token oat_*.
   * @responseBody 200 - { user: {...}, token: "oat_..." } - Login correcto
   * @responseBody 422 - <ValidationError[]> - Error de validación (email inválido, password corto)
  */
  async store({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)

    user.lastSeenAt = DateTime.now()
    await user.save()

    const token = await User.accessTokens.create(user)

    return response.ok({
      user: UserTransformer.toJSON(user),
      token: token.value!.release(),
    })
  }

  /**
   * POST /account/logout
   * Revoca el token usado en la petición actual.
   */
  async destroy({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = user.currentAccessToken
    await User.accessTokens.delete(user, token.identifier)

    return response.ok({ revoked: true })
  }
}
