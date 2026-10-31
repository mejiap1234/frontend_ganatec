import { useEffect, useState } from "react";

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

import {
  LayoutDashboard,
  Beef,
  HeartPulse,
  Dna,
  Milk,
  Map,
  Package,
  WalletCards,
  Bell,
  Bot,
  LogOut,
  Menu,
  X,
  UsersRound
} from "lucide-react";

import { GiCow } from "react-icons/gi";

import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ children }) => {
  const { usuario, logout } = useAuth();

  const navigate = useNavigate();
  const esPaginaIA = useLocation().pathname === "/ia";

  const [menuAbierto, setMenuAbierto] = useState(false);

  // Permitir cerrar con Escape sin desplazar la pagina detras del menu.
  useEffect(() => {
    if (!menuAbierto) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const cerrarConEscape = (event) => {
      if (event.key === "Escape") setMenuAbierto(false);
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [menuAbierto]);

  const cerrarSesion = () => {
    logout();

    navigate("/login");
  };

  const opciones = [
    {
      nombre: "Dashboard",
      icono: LayoutDashboard,
      ruta: "/dashboard",
    },

    {
      nombre: "Animales",
      icono: GiCow,
      ruta: "/animales",
    },

    {
      nombre: "Salud",
      icono: HeartPulse,
      ruta: "/salud",
    },

    {
      nombre: "Reproducción",
      icono: Dna,
      ruta: "/reproduccion",
    },

    {
      nombre: "Producción de leche",
      icono: Milk,
      ruta: "/leche",
    },

    {
      nombre: "Potreros y lotes",
      icono: Map,
      ruta: "/potreros",
    },

    {
      nombre: "Inventario",
      icono: Package,
      ruta: "/inventario",
    },

    {
  nombre: "Finanzas",
  icono: WalletCards,
  ruta: "/finanzas",
  rolesPermitidos: ["administrador", "superadministrador"],
},

    {
      nombre: "Alertas",
      icono: Bell,
      ruta: "/alertas",
    },
  ];


  // Filtra los módulos según el rol del usuario.
const opcionesVisibles = opciones.filter((opcion) => {
  if (!opcion.rolesPermitidos) {
    return true;
  }

  return opcion.rolesPermitidos.includes(usuario?.rol);
});

  return (
    <div className="ganatec-app">
      {/* SIDEBAR */}

      <aside className={`sidebar ${menuAbierto ? "sidebar-abierto" : ""}`}>
        <div className="sidebar-header">
<div className="brand-logo">
  <img src={logo} alt="Logo GANATEC" />
</div>
          <div className="brand-text">
            <strong>GANATEC</strong>

            <span>Gestión ganadera</span>
          </div>

          <button
            className="sidebar-cerrar"
            type="button"
            aria-label="Cerrar menú lateral"
            onClick={() => setMenuAbierto(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {opcionesVisibles.map(({ nombre, icono: Icono, ruta }) => (
            <NavLink
              key={ruta}
              to={ruta}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) =>
                isActive ? "nav-item activo" : "nav-item"
              }
            >
              <Icono size={19} />

              <span>{nombre}</span>
            </NavLink>
          ))}

          {/* Gestión de personal: solo administradores */}
{usuario?.rol === "administrador" && (
  <NavLink
    to="/trabajadores"
    onClick={() => setMenuAbierto(false)}
    className={({ isActive }) =>
      isActive ? "nav-item activo" : "nav-item"
    }
  >
    <UsersRound size={19} />
    <span>Trabajadores</span>
  </NavLink>
)}
        </nav>

        <NavLink
          to="/ia"
          className="sidebar-ia"
          onClick={() => setMenuAbierto(false)}
        >
          <Bot size={20} />

          <div>
            <strong>IA GANATEC</strong>

            <span>Asistente inteligente</span>
          </div>
        </NavLink>

        <div className="sidebar-footer">
          <div className="usuario-mini">
            <div className="avatar">
              {usuario?.nombre?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>{usuario?.nombre || "Usuario"}</strong>

              <span>{usuario?.rol || "GANATEC"}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={cerrarSesion}
            title="Cerrar sesión"
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}

      {menuAbierto && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <div className={esPaginaIA ? "main-wrapper main-wrapper--ia" : "main-wrapper"}>
        <header className="topbar">
          <button
            className="menu-mobile"
            type="button"
            aria-label="Abrir menú lateral"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
          >
            <Menu size={23} />
          </button>

          <div>
            <h2>GANATEC</h2>

            <span>Gestión inteligente de tu finca</span>
          </div>
        </header>

        <main className={esPaginaIA ? "main-content main-content--ia" : "main-content"}>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
