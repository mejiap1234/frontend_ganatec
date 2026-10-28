import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    "Content-Type": "application/json"
  }
});


// Agregar token automáticamente.
api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "ganatec_token"
      );


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    return config;

  },

  (error) =>
    Promise.reject(error)
);


// Si el token expiró o no es válido.
api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (
      error.response?.status === 401
    ) {

      localStorage.removeItem(
        "ganatec_token"
      );

      localStorage.removeItem(
        "ganatec_usuario"
      );


      if (
        window.location.pathname
        !== "/login"
      ) {

        window.location.href =
          "/login";

      }

    }


    return Promise.reject(error);

  }

);


export default api;