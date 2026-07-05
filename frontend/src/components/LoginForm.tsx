import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
        <Input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
        <p className="text-center text-sm text-[var(--color-muted-foreground)]">
          ¿No tienes cuenta?{' '}
          <Link to="/signup" className="underline">
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
