import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProfile, getUser, logout } from '@/services/authService'
import type { User } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(getUser())

  useEffect(() => {
    fetchProfile()
      .then(setUser)
      .catch(() => handleLogout())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-muted)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Sesión iniciada como:
          </p>
          <div className="rounded-md bg-[var(--color-muted)] p-4 text-sm">
            <p>
              <strong>{user?.fullName ?? 'Sin nombre'}</strong>
            </p>
            <p>{user?.email}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
