import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SignupForm() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await signup({ fullName: fullName || undefined, email, password })
      navigate('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
        <Input placeholder="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Contraseña (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creando…' : 'Registrarme'}
        </Button>
        <p className="text-center text-sm text-[var(--color-muted-foreground)]">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="underline">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
