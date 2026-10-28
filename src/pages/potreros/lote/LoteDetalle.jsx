import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Plus,
  MapPin,
  Users,
  MoveRight,
  Eye,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  obtenerAnimalesLote,
  obtenerHistorialPotrerosLote,
} from "../../../services/potreros/potreros.service";


const LoteDetalle = () => {

  const { loteId } =
    useParams();

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [lote, setLote] =
    useState(null);

  const [animales, setAnimales] =
    useState([]);

  const [
    ubicacionActual,
    setUbicacionActual,
  ] = useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR INFORMACIÓN DEL LOTE
  ========================================================= */

  const cargarDatos = async () => {

    try {

      setCargando(true);

      setError("");


      const [
        respuestaAnimales,
        respuestaUbicacion,
      ] = await Promise.all([

        obtenerAnimalesLote(
          loteId
        ),

        obtenerHistorialPotrerosLote(
          loteId
        ),

      ]);


      setLote(
        respuestaAnimales?.lote
        ||
        respuestaUbicacion?.lote
        ||
        null
      );


      setAnimales(
        Array.isArray(
          respuestaAnimales?.animales
        )
          ? respuestaAnimales.animales
          : []
      );


      setUbicacionActual(
        respuestaUbicacion
          ?.ubicacion_actual
        ||
        null
      );


    } catch (error) {

      console.error(
        "Error cargando lote:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible cargar la información del lote."
      );


    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarDatos();

  }, [loteId]);


  /* =========================================================
     INDICADORES
  ========================================================= */

  const totalAnimales =
    animales.length;


  const hembras =
    animales.filter(
      (animal) =>
        animal.sexo === "hembra"
    ).length;


  const machos =
    animales.filter(
      (animal) =>
        animal.sexo === "macho"
    ).length;


  /* =========================================================
     ESTADOS DE CARGA
  ========================================================= */

  if (cargando) {

    return (

      <div className="dashboard-loading">

        Cargando lote...

      </div>

    );

  }


  if (error && !lote) {

    return (

      <div className="dashboard-error">

        {error}

      </div>

    );

  }


  if (!lote) {

    return (

      <div className="dashboard-error">

        Lote no encontrado.

      </div>

    );

  }


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
                "/potreros/lotes"
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            {lote.nombre}
          </h2>


          <p>

            {
              lote.descripcion
              ||
              "Gestión de animales y ubicación del lote."
            }

          </p>

        </div>


        <button
          type="button"
          className="boton-principal"
          onClick={() =>
            navigate(
              `/potreros/lotes/${loteId}/agregar-animal`
            )
          }
        >

          <Plus size={17} />

          Agregar animal

        </button>

      </div>


      {error && (

        <div className="dashboard-error">

          {error}

        </div>

      )}


      {/* =====================================================
          RESUMEN
      ===================================================== */}

      <div className="potreros-resumen">

        <div>

          <span>
            Animales
          </span>

          <strong>
            {totalAnimales}
          </strong>

          <small>
            Actualmente en el lote
          </small>

        </div>


        <div>

          <span>
            Hembras
          </span>

          <strong>
            {hembras}
          </strong>

          <small>
            Animales hembra
          </small>

        </div>


        <div>

          <span>
            Machos
          </span>

          <strong>
            {machos}
          </strong>

          <small>
            Animales macho
          </small>

        </div>


        <div>

          <span>
            Estado
          </span>

          <strong className="texto-capitalizado">

            {
              lote.estado
              ||
              "-"
            }

          </strong>

          <small>
            Estado del lote
          </small>

        </div>

      </div>


      {/* =====================================================
          UBICACIÓN ACTUAL
      ===================================================== */}

      <div className="dashboard-panel">

        <div className="lista-header">

          <div>

            <h3>
              Ubicación actual
            </h3>

            <span>
              Potrero donde se encuentra el lote
            </span>

          </div>


          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                `/potreros/lotes/${loteId}/mover-potrero`
              )
            }
          >

            <MoveRight size={16} />

            Mover lote

          </button>

        </div>


        {ubicacionActual ? (

          <div className="potrero-descanso-actual">

            <div>

              <span>
                Potrero
              </span>

              <strong>

                {
                  ubicacionActual
                    .potrero_nombre
                }

              </strong>

            </div>


            <div>

              <span>
                Fecha de ingreso
              </span>

              <strong>

                {
                  ubicacionActual
                    .fecha_ingreso
                    ? new Date(
                        ubicacionActual
                          .fecha_ingreso
                      )
                        .toLocaleDateString(
                          "es-CO"
                        )
                    : "-"
                }

              </strong>

            </div>


            <div>

              <span>
                Permanencia
              </span>

              <strong>

                {
                  ubicacionActual
                    .dias_permanencia
                  ||
                  0
                } días

              </strong>

            </div>

          </div>

        ) : (

          <div className="estado-vacio">

            <MapPin size={26} />

            <p>
              Este lote todavía no está
              ubicado en ningún potrero.
            </p>

          </div>

        )}

      </div>


      {/* =====================================================
          ANIMALES DEL LOTE
      ===================================================== */}

      <div className="dashboard-panel">

        <div className="lista-header">

          <div>

            <h3>
              Animales del lote
            </h3>

            <span>

              {
                totalAnimales
              } animales actuales

            </span>

          </div>


          <button
            type="button"
            className="boton-principal"
            onClick={() =>
              navigate(
                `/potreros/lotes/${loteId}/agregar-animal`
              )
            }
          >

            <Plus size={16} />

            Agregar animal

          </button>

        </div>


        {animales.length === 0 ? (

          <div className="estado-vacio">

            <Users size={28} />

            <p>
              Este lote todavía no tiene
              animales asignados.
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
                    Ingreso al lote
                  </th>

                  <th>
                    Acciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {animales.map(
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

                        {
                          animal.fecha_ingreso
                            ? new Date(
                                animal.fecha_ingreso
                              )
                                .toLocaleDateString(
                                  "es-CO"
                                )
                            : "-"
                        }

                      </td>


                      <td>

                        <div className="acciones-tabla">

                          <button
                            type="button"
                            className="boton-tabla"
                            onClick={() =>
                              navigate(
                                `/animales/${animal.id}`
                              )
                            }
                          >

                            <Eye size={14} />

                            Ver

                          </button>


                          <button
                            type="button"
                            className="boton-tabla"
                            onClick={() =>
                              navigate(
                                `/potreros/lotes/${loteId}/animal/${animal.id}/mover`
                              )
                            }
                          >

                            Cambiar lote

                          </button>


                          <button
                            type="button"
                            className="boton-tabla"
                            onClick={() =>
                              navigate(
                                `/potreros/lotes/${loteId}/animal/${animal.id}/retirar`
                              )
                            }
                          >

                            Retirar

                          </button>

                        </div>

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


export default LoteDetalle;