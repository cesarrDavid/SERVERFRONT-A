import { useState } from 'react'
import './App.css'

function App() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function iniciarSesion(event) {
    event.preventDefault()
    setCargando(true)
    setError('')

    try {
      // Paso 1: Autenticarse en el Backend
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario,
          password
        })
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(
          datos.error || 'No se pudo iniciar sesión'
        )
      }

      if (!datos.token) {
        throw new Error('El servidor no devolvió un token')
      }

      // Paso 2: Solicitar el dashboard con el JWT
      const respuestaDashboard = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${datos.token}`
        }
      })

      const datosDashboard = await respuestaDashboard.json()

      if (!respuestaDashboard.ok) {
        throw new Error(
          datosDashboard.error || 'Acceso denegado'
        )
      }

      // Paso 3: Mostrar la información autorizada
      setDashboard(datosDashboard)
      setPassword('')

    } catch (err) {
      setError(err.message || 'Error de conexión')
    } finally {
      setCargando(false)
    }
  }

  function cerrarSesion() {
    setDashboard(null)
    setUsuario('')
    setPassword('')
    setError('')
  }

  if (dashboard) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-icon">🛡️</div>

          <h1>Dashboard Seguro</h1>
          <p className="subtitle">
            Acceso autorizado mediante JWT
          </p>

          <h2>¡Bienvenido!</h2>

          <p>
            <strong>Usuario:</strong> {dashboard.usuario}
          </p>

          <p>
            <strong>Rol:</strong> {dashboard.rol}
          </p>

          <p className="footer-text">
            Sesión autenticada por el Backend
          </p>

          <button type="button" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-icon">🔐</div>

        <h1>Zero Trust</h1>
        <p className="subtitle">
          Sistema de acceso seguro
        </p>

        <form onSubmit={iniciarSesion}>
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            placeholder="Ingresa tu usuario"
            autoComplete="username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p role="alert" style={{ color: '#ff8080' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="footer-text">
          Acceso restringido a usuarios autorizados
        </p>
      </section>
    </main>
  )
}

export default App
