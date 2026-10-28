
import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  UserRound,
  Mail,
  Lock,
  House,
  UserPlus
} from "lucide-react";

import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  // 1. Información del usuario y de su finca.
  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmarPassword: "",
    nombreFinca: ""
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // 2. Actualiza los campos del formulario.
  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // 3. Valida y envía el registro al backend.
  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setError("");

    const {
      nombre,
      apellido,
      email,
      password,
      confirmarPassword,
      nombreFinca
    } = formulario;

    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !email.trim() ||
      !password ||
      !nombreFinca.trim()
    ) {
      setError("Completa todos los campos.");
      return;
    }

    if (password.length < 8) {
      setError(
        "La contraseña debe tener mínimo 8 caracteres."
      );
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      // El backend crea el administrador y su finca.
      await api.post("/auth/register", {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        password,
        nombreFinca: nombreFinca.trim()
      });

      // El registro no inicia sesión automáticamente.
      navigate("/login", {
        replace: true,
        state: {
          registroExitoso: true
        }
      });

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "No fue posible completar el registro."
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card register-card">

        {/* IDENTIDAD GANATEC */}
        <div className="login-brand">
          <div className="login-logo">G</div>

          <div>
            <h1>GANATEC</h1>
            <p>Gestión inteligente de tu ganadería</p>
          </div>
        </div>

        {/* ENCABEZADO */}
        <div className="login-header">
          <h2>Crear cuenta</h2>

          <p>
            Registra tus datos y comienza a
            gestionar tu finca de manera inteligente.
          </p>
        </div>

        <form onSubmit={manejarSubmit}>

          {/* NOMBRE Y APELLIDO */}
          <div className="register-grid">
            <div>
              <label htmlFor="nombre">
                Nombre
              </label>

              <div className="input-group">
                <UserRound size={19} />

                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="apellido">
                Apellido
              </label>

              <div className="input-group">
                <UserRound size={19} />

                <input
                  id="apellido"
                  type="text"
                  name="apellido"
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  value={formulario.apellido}
                  onChange={manejarCambio}
                  required
                />
              </div>
            </div>
          </div>

          {/* CORREO */}
          <label htmlFor="registro-email">
            Correo electrónico
          </label>

          <div className="input-group">
            <Mail size={19} />

            <input
              id="registro-email"
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              value={formulario.email}
              onChange={manejarCambio}
              required
            />
          </div>

          {/* NOMBRE DE LA FINCA */}
          <label htmlFor="nombreFinca">
            Nombre de tu finca
          </label>

          <div className="input-group">
            <House size={19} />

            <input
              id="nombreFinca"
              type="text"
              name="nombreFinca"
              placeholder="Ej. Finca El Paraíso"
              value={formulario.nombreFinca}
              onChange={manejarCambio}
              required
            />
          </div>

          {/* CONTRASEÑA */}
          <label htmlFor="registro-password">
            Contraseña
          </label>

          <div className="input-group">
            <Lock size={19} />

            <input
              id="registro-password"
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              value={formulario.password}
              onChange={manejarCambio}
              required
            />
          </div>

          {/* CONFIRMACIÓN */}
          <label htmlFor="confirmarPassword">
            Confirmar contraseña
          </label>

          <div className="input-group">
            <Lock size={19} />

            <input
              id="confirmarPassword"
              type="password"
              name="confirmarPassword"
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              value={formulario.confirmarPassword}
              onChange={manejarCambio}
              required
            />
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {/* BOTÓN DE REGISTRO */}
          <button
            type="submit"
            className="login-button"
            disabled={cargando}
          >
            <UserPlus size={18} />

            {cargando
              ? "Creando cuenta..."
              : "Crear mi cuenta"}
          </button>
        </form>

        {/* REGRESAR AL LOGIN */}
        <div className="auth-enlace">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">
            Iniciar sesión
          </Link>
        </div>

        <div className="login-footer">
          GANATEC · Gestión ganadera inteligente
        </div>

      </div>
    </div>
  );
};

export default Register;
