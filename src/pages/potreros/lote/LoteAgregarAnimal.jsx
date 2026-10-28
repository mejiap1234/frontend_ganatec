import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Search,
  UserPlus,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  obtenerAnimalesDisponibles,
  agregarAnimalLote,
} from "../../../services/potreros/potreros.service";


const LoteAgregarAnimal = () => {

  const { loteId } =
    useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [animales, setAnimales] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [
    animalAgregando,
    setAnimalAgregando,
  ] = useState(null);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");


  /* =========================================================
     CARGAR ANIMALES DISPONIBLES
  ========================================================= */

  const cargarAnimales = async () => {

    try {

      setCargando(true);

      setError("");


      const respuesta =
        await obtenerAnimalesDisponibles();


      setAnimales(
        Array.isArray(
          respuesta?.animales
        )
          ? respuesta.animales
          : []
      );


    } catch (error) {

      console.error(
        "Error cargando animales disponibles:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible consultar los animales disponibles."
      );


    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarAnimales();

  }, []);


  /* =========================================================
     FILTRAR ANIMALES
  ========================================================= */

  const animalesFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      if (!texto) {

        return animales;

      }


      return animales.filter(
        (animal) => {

          const contenido =
            [
              animal.nombre,
              animal.identificacion,
              animal.raza,
              animal.sexo,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return contenido.includes(
            texto
          );

        }
      );

    }, [
      animales,
      busqueda,
    ]);


  /* =========================================================
     AGREGAR ANIMAL
  ========================================================= */

  const manejarAgregar =
    async (animal) => {

      try {

        setAnimalAgregando(
          animal.id
        );

        setError("");

        setMensaje("");


        await agregarAnimalLote(
          loteId,
          animal.id
        );


        setMensaje(
          `${animal.nombre || animal.identificacion} fue agregado al lote correctamente.`
        );


        setAnimales(
          (anteriores) =>
            anteriores.filter(
              (item) =>
                item.id !== animal.id
            )
        );


      } catch (error) {

        console.error(
          "Error agregando animal al lote:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible agregar el animal al lote."
        );


      } finally {

        setAnimalAgregando(
          null
        );

      }

    };


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <>

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="modulo-subheader">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                `/potreros/lotes/${loteId}`
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Agregar animal
          </h2>


          <p>
            Selecciona un animal activo
            que todavía no pertenece a ningún lote.
          </p>

        </div>

      </div>


      {/* =====================================================
          MENSAJES
      ===================================================== */}

      {error && (

        <div className="dashboard-error">

          {error}

        </div>

      )}


      {mensaje && (

        <div className="mensaje-exito">

          {mensaje}

        </div>

      )}


      {/* =====================================================
          BUSCADOR
      ===================================================== */}

      <div className="potreros-filtros">

        <div className="buscador-potreros">

          <Search size={17} />

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


      {/* =====================================================
          LISTADO
      ===================================================== */}

      <div className="dashboard-panel">

        <div className="lista-header">

          <div>

            <h3>
              Animales disponibles
            </h3>

            <span>

              {
                animalesFiltrados.length
              } disponibles

            </span>

          </div>

        </div>


        {cargando ? (

          <div className="dashboard-loading">

            Cargando animales...

          </div>

        ) : animalesFiltrados.length === 0 ? (

          <div className="estado-vacio">

            <UserPlus size={28} />

            <p>
              No hay animales disponibles
              para agregar a este lote.
            </p>

          </div>

        ) : (

          <div className="tabla-contenedor">

            <table className="tabla-ganatec">

              <thead>

                <tr>

                  <th>
                    Animal
                  </th>

                  <th>
                    Identificación
                  </th>

                  <th>
                    Sexo
                  </th>

                  <th>
                    Raza
                  </th>

                  <th>
                    Acción
                  </th>

                </tr>

              </thead>


              <tbody>

                {animalesFiltrados.map(
                  (animal) => (

                    <tr
                      key={animal.id}
                    >

                      <td>

                        <strong>

                          {
                            animal.nombre
                            ||
                            "Sin nombre"
                          }

                        </strong>

                      </td>


                      <td>

                        {
                          animal.identificacion
                          ||
                          "-"
                        }

                      </td>


                      <td className="texto-capitalizado">

                        {
                          animal.sexo
                          ||
                          "-"
                        }

                      </td>


                      <td>

                        {
                          animal.raza
                          ||
                          "-"
                        }

                      </td>


                      <td>

                        <button
                          type="button"
                          className="boton-principal"
                          disabled={
                            animalAgregando ===
                            animal.id
                          }
                          onClick={() =>
                            manejarAgregar(
                              animal
                            )
                          }
                        >

                          <UserPlus
                            size={15}
                          />

                          {
                            animalAgregando ===
                            animal.id
                              ? "Agregando..."
                              : "Agregar"
                          }

                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </>

  );

};


export default LoteAgregarAnimal;