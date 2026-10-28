import {
  createContext,
  useContext,
  useState
} from "react";

import api from "../services/api";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

  const [usuario, setUsuario] = useState(() => {

    try {

      const guardado =
        localStorage.getItem("ganatec_usuario");

      return guardado
        ? JSON.parse(guardado)
        : null;

    } catch (error) {

      console.error(
        "Error leyendo usuario guardado:",
        error
      );

      localStorage.removeItem(
        "ganatec_usuario"
      );

      localStorage.removeItem(
        "ganatec_token"
      );

      return null;

    }

  });


  const login = async (
    email,
    password
  ) => {

    const respuesta = await api.post(
      "/auth/login",
      {
        email,
        password
      }
    );


    console.log(
      "Respuesta login:",
      respuesta.data
    );


    const token =
      respuesta.data.token;

    const usuarioRecibido =
      respuesta.data.usuario;


    if (!token) {

      throw new Error(
        "El backend no devolvió un token"
      );

    }


    localStorage.setItem(
      "ganatec_token",
      token
    );


    if (usuarioRecibido) {

      localStorage.setItem(
        "ganatec_usuario",
        JSON.stringify(
          usuarioRecibido
        )
      );

      setUsuario(
        usuarioRecibido
      );

    } else {

      // Temporal hasta comprobar
      // la estructura exacta del login.
      const usuarioTemporal = {
        autenticado: true
      };

      localStorage.setItem(
        "ganatec_usuario",
        JSON.stringify(
          usuarioTemporal
        )
      );

      setUsuario(
        usuarioTemporal
      );

    }


    return respuesta.data;

  };


  const logout = () => {

    localStorage.removeItem(
      "ganatec_token"
    );

    localStorage.removeItem(
      "ganatec_usuario"
    );

    setUsuario(null);

  };


  return (

    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        autenticado:
          Boolean(usuario)
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};


export const useAuth = () => {

  const contexto =
    useContext(AuthContext);


  if (!contexto) {

    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );

  }


  return contexto;

};