import {
  useState
} from "react";
import logo from "../assets/logo.png";

import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";
import {
  useAuth
} from "../context/AuthContext";

import {
  LogIn,
  Mail,
  Lock
} from "lucide-react";


const Login = () => {

  const navigate =
    useNavigate();

  const location = useLocation();

  const {
    login
  } = useAuth();


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [cargando, setCargando] =
    useState(false);


  const manejarSubmit = async (
    e
  ) => {

    e.preventDefault();

    setError("");
    setCargando(true);


    try {

      await login(
        email,
        password
      );

      navigate(
        "/dashboard"
      );

    } catch (error) {

      setError(
        error.response?.data?.message
        ||
        "No fue posible iniciar sesión"
      );

    } finally {

      setCargando(false);

    }

  };


  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-brand">

        <div className="brand-logo">
  <img src={logo} alt="Logo GANATEC" />
</div>

          <div>

            <h1>
              GANATEC
            </h1>

            <p>
              Gestión inteligente
              de tu ganadería
            </p>

          </div>

        </div>


        <div className="login-header">

          <h2>
            Bienvenido
          </h2>

          <p>
            Ingresa tus datos para
            acceder a tu finca.
          </p>

        </div>

      {/* Confirmación después de registrar la cuenta */}
{location.state?.registroExitoso && (
  <div className="registro-exito" role="status">
    Tu cuenta y finca fueron creadas correctamente.
    Ya puedes iniciar sesión.
  </div>
)}
        <form
          onSubmit={
            manejarSubmit
          }
        >

          <label>
            Correo electrónico
          </label>

          <div className="input-group">

            <Mail size={19} />

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={
                e =>
                  setEmail(
                    e.target.value
                  )
              }
              required
            />

          </div>


          <label>
            Contraseña
          </label>

          <div className="input-group">

            <Lock size={19} />

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={
                e =>
                  setPassword(
                    e.target.value
                  )
              }
              required
            />

          </div>


          {error && (

            <div className="login-error">
              {error}
            </div>

          )}


          <button
            type="submit"
            className="login-button"
            disabled={cargando}
          >

            <LogIn size={18} />

            {
              cargando
                ? "Ingresando..."
                : "Iniciar sesión"
            }

          </button>

        </form>
{/* Acceso al registro de nuevos usuarios */}
<div className="auth-enlace">
  ¿No tienes una cuenta?{" "}
  <Link to="/register">
    Regístrate aquí
  </Link>
</div>

        <div className="login-footer">
          GANATEC · Gestión ganadera inteligente
        </div>

      </div>

    </div>

  );

};


export default Login;