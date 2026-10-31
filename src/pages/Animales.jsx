import ModalGanatec from "../components/ModalGanatec";
import {
  useEffect,
  useState
} from "react";

import {
  Search,
  Plus
} from "lucide-react";

import DashboardLayout
  from "../layouts/DashboardLayout";

import {
  obtenerAnimales,
   registrarAnimal,
   
} from "../services/animales.service";

import {
  useNavigate
} from "react-router-dom";


const Animales = () => {

  // Animales obtenidos del backend
  const [animales, setAnimales] =
    useState([]);

  // Texto escrito en el buscador
  const [busqueda, setBusqueda] =
    useState("");

  // Estados de carga
  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] =
  useState(false);

  const [formulario, setFormulario] =
  useState({
    identificacion: "",
    nombre: "",
    sexo: "",
    raza: "",
    fecha_nacimiento: ""
  });


const [guardando, setGuardando] =
  useState(false);


const [errorFormulario, setErrorFormulario] =
  useState("");


const [mensaje, setMensaje] =
  useState("");

const navigate = useNavigate();


  // Cargar animales al entrar a la página
  useEffect(() => {

    const cargarAnimales = async () => {

      try {

        const respuesta =
          await obtenerAnimales();

        console.log(
          "Animales:",
          respuesta
        );


        // Dependiendo de cómo responda el backend
        if (Array.isArray(respuesta)) {

          setAnimales(respuesta);

        } else if (
          Array.isArray(respuesta?.animales)
        ) {

          setAnimales(
            respuesta.animales
          );

        } else {

          setAnimales([]);

        }

      } catch (error) {

        console.error(
          "Error cargando animales:",
          error
        );

        setError(
          "No fue posible cargar los animales."
        );

      } finally {

        setCargando(false);

      }

    };


    cargarAnimales();

  }, []);


const manejarCambio = (e) => {

  const {
    name,
    value
  } = e.target;


  setFormulario(
    (anterior) => ({
      ...anterior,
      [name]: value
    })
  );

};

const manejarRegistrarAnimal = async (e) => {

  e.preventDefault();

  setErrorFormulario("");
  setMensaje("");


  if (
    !formulario.identificacion.trim()
    ||
    !formulario.sexo
  ) {

    setErrorFormulario(
      "La identificación y el sexo son obligatorios."
    );

    return;
  }


  try {

    setGuardando(true);


    const datosEnviar = {

      identificacion:
        formulario.identificacion.trim(),

      sexo:
        formulario.sexo,

      ...(formulario.nombre.trim() && {
        nombre:
          formulario.nombre.trim()
      }),

      ...(formulario.raza.trim() && {
        raza:
          formulario.raza.trim()
      }),

      ...(formulario.fecha_nacimiento && {
        fecha_nacimiento:
          formulario.fecha_nacimiento
      })

    };


    await registrarAnimal(
      datosEnviar
    );


    // Volvemos a consultar la lista
    const actualizados =
      await obtenerAnimales();


    if (Array.isArray(actualizados)) {

      setAnimales(actualizados);

    } else if (
      Array.isArray(
        actualizados?.animales
      )
    ) {

      setAnimales(
        actualizados.animales
      );

    }


    // Limpiar formulario
    setFormulario({
      identificacion: "",
      nombre: "",
      sexo: "",
      raza: "",
      fecha_nacimiento: ""
    });


    setMostrarFormulario(false);


    setMensaje(
      "Animal registrado correctamente."
    );


  } catch (error) {

    console.error(
      "Error registrando animal:",
      error
    );


    setErrorFormulario(
      error.response?.data?.message
      ||
      error.response?.data?.error
      ||
      "No fue posible registrar el animal."
    );


  } finally {

    setGuardando(false);

  }

};

  // Filtrar animales con el buscador
  const animalesFiltrados =
    animales.filter((animal) => {

      const texto =
        busqueda
          .toLowerCase()
          .trim();


      if (!texto) {
        return true;
      }


      const nombre =
        String(
          animal.nombre || ""
        ).toLowerCase();

      const identificacion =
        String(
          animal.identificacion || ""
        ).toLowerCase();

      const raza =
        String(
          animal.raza || ""
        ).toLowerCase();


      return (
        nombre.includes(texto)
        ||
        identificacion.includes(texto)
        ||
        raza.includes(texto)
      );

    });


  return (

    <DashboardLayout>

      {/* ENCABEZADO */}

      <section className="pagina-header">

        <div>

          <p className="dashboard-label">
            Gestión ganadera
          </p>

          <h1>
            Animales
          </h1>

          <p>
            Consulta y administra los animales registrados.
          </p>

        </div>


        <button
            className="boton-principal"
            type="button"
            onClick={() =>
                setMostrarFormulario(true)
            }
            >
            <Plus size={18} />

            Registrar animal
        </button>

      </section>

     {mensaje && (

  <div className="mensaje-exito">
    {mensaje}
  </div>

)} 

      <ModalGanatec
        abierto={mostrarFormulario}
        titulo="Registrar animal"
        onClose={() => setMostrarFormulario(false)}
      >
  <form
  className="formulario-animal registro-modal-form"
  onSubmit={manejarRegistrarAnimal}
>

    <div className="form-grid">

      <div className="campo-formulario">

        <label>
          Identificación
        </label>

        <input
  type="text"
  name="identificacion"
  placeholder="Ej: A-005"
  value={formulario.identificacion}
  onChange={manejarCambio}
/>

      </div>


      <div className="campo-formulario">

        <label>
          Nombre
        </label>

        <input
        type="text"
        name="nombre"
        placeholder="Nombre del animal"
        value={formulario.nombre}
        onChange={manejarCambio}
      />

      </div>


      <div className="campo-formulario">

        <label>
          Sexo
        </label>

        <select
  name="sexo"
  value={formulario.sexo}
  onChange={manejarCambio}
>

  <option value="" disabled>
    Seleccionar
  </option>

  <option value="hembra">
    Hembra
  </option>

  <option value="macho">
    Macho
  </option>

</select>

      </div>


      <div className="campo-formulario">

        <label>
          Raza
        </label>

        <input
  type="text"
  name="raza"
  placeholder="Ej: Brahman Rojo"
  value={formulario.raza}
  onChange={manejarCambio}
/>

      </div>


      <div className="campo-formulario">

        <label>
          Fecha de nacimiento
        </label>

        <input
  type="date"
  name="fecha_nacimiento"
  value={formulario.fecha_nacimiento}
  onChange={manejarCambio}
/>

      </div>

    </div>


    <div className="formulario-acciones">

      {errorFormulario && (

  <p className="formulario-error">
    {errorFormulario}
  </p>

)}

      <button
        type="button"
        className="boton-secundario"
        onClick={() =>
          setMostrarFormulario(false)
        }
      >
        Cancelar
      </button>

     <button
  type="submit"
  className="boton-principal"
  disabled={guardando}
>
  {
    guardando
      ? "Guardando..."
      : "Guardar animal"
  }
</button>

    </div>

  </form>
      </ModalGanatec>

      {/* CARGANDO */}

      {cargando && (

        <div className="dashboard-panel">

          Cargando animales...

        </div>

      )}


      {/* ERROR */}

      {error && (

        <div className="dashboard-error">

          {error}

        </div>

      )}


      {/* LISTADO */}

      {!cargando && !error && (

        <div className="dashboard-panel">


          {/* TÍTULO Y BUSCADOR */}

          <div className="lista-header">

            <div>

              <h3>
                Animales registrados
              </h3>

              <span>
                {animalesFiltrados.length} resultados
              </span>

            </div>


            <div className="buscador">

              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar por nombre, identificación o raza..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* SI NO HAY RESULTADOS */}

          {animalesFiltrados.length === 0 ? (

            <p>
              No se encontraron animales.
            </p>

          ) : (

            /* TABLA */

            <div className="tabla-contenedor">

              <table className="tabla-ganatec tabla-apilable" aria-label="Animales registrados">

                <thead>

                  <tr>

                    <th>
                      Identificación
                    </th>

                    <th>
                      Nombre
                    </th>

                    <th>
                      Sexo
                    </th>

                    <th>
                      Raza
                    </th>

                    <th>
                      Estado
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {animalesFiltrados.map(
                    (animal) => (

                      <tr
  key={animal.id}
  className="fila-clickeable"
  onClick={() =>
    navigate(
      `/animales/${animal.id}`
    )
  }
>

                        <td data-label="Identificación">
                          {
                            animal.identificacion
                          }
                        </td>


                        <td data-label="Nombre">
                          {
                            animal.nombre
                            ||
                            "Sin nombre"
                          }
                        </td>


                        <td data-label="Sexo">
                          {
                            animal.sexo
                            ||
                            "-"
                          }
                        </td>


                        <td data-label="Raza">
                          {
                            animal.raza
                            ||
                            "No registrada"
                          }
                        </td>


                        <td data-label="Estado">

                          <span
                            className={
                              `estado-animal ${
                                animal.estado
                              }`
                            }
                          >

                            {
                              animal.estado
                            }

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

    </DashboardLayout>

  );

};


export default Animales;