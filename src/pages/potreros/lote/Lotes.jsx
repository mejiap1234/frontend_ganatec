import ModalGanatec from "../../../components/ModalGanatec";
import LoteNuevo from "./LoteNuevo";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Layers3,
  Plus,
  Search,
  Users,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  obtenerLotes,
} from "../../../services/potreros/potreros.service";


const Lotes = () => {

  const [modalNuevoLote, setModalNuevoLote] = useState(false);
  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [lotes, setLotes] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState("todos");

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR LOTES
  ========================================================= */

  const cargarLotes = async () => {

    try {

      setCargando(true);

      setError("");


      const respuesta =
        await obtenerLotes();


      setLotes(
        Array.isArray(
          respuesta?.lotes
        )
          ? respuesta.lotes
          : []
      );


    } catch (error) {

      console.error(
        "Error cargando lotes:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible cargar los lotes."
      );


    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarLotes();

  }, []);


  /* =========================================================
     INDICADORES
  ========================================================= */

  const totalLotes =
    lotes.length;


  const activos =
    lotes.filter(
      (lote) =>
        lote.estado === "activo"
    ).length;


  const inactivos =
    lotes.filter(
      (lote) =>
        lote.estado === "inactivo"
    ).length;


  const totalAnimales =
    lotes.reduce(
      (
        acumulado,
        lote
      ) =>
        acumulado
        +
        Number(
          lote.total_animales
          ||
          0
        ),
      0
    );


  /* =========================================================
     FILTRAR LOTES
  ========================================================= */

  const lotesFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      return lotes.filter(
        (lote) => {

          const coincideEstado =
            filtroEstado === "todos"
            ||
            lote.estado === filtroEstado;


          const contenido =
            [
              lote.nombre,
              lote.descripcion,
              lote.estado,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          const coincideBusqueda =
            !texto
            ||
            contenido.includes(
              texto
            );


          return (
            coincideEstado
            &&
            coincideBusqueda
          );

        }
      );

    }, [
      lotes,
      busqueda,
      filtroEstado,
    ]);


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <>

      <ModalGanatec abierto={modalNuevoLote} titulo="Nuevo lote" onClose={() => setModalNuevoLote(false)}>
        {modalNuevoLote && (
          <LoteNuevo modoModal onClose={() => setModalNuevoLote(false)} onSuccess={() => {
            setModalNuevoLote(false);
            cargarLotes();
          }} />
        )}
      </ModalGanatec>

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="modulo-subheader">

        <div>

          <h2>
            Lotes de animales
          </h2>

          <p>
            Organiza los animales en grupos
            para facilitar su manejo y rotación.
          </p>

        </div>


        <button
          type="button"
          className="boton-principal"
          onClick={() =>
            setModalNuevoLote(true)
          }
        >

          <Plus size={17} />

          Nuevo lote

        </button>

      </div>


      {/* =====================================================
          CARGA / ERROR
      ===================================================== */}

      {cargando ? (

        <div className="dashboard-loading">

          Cargando lotes...

        </div>

      ) : error ? (

        <div className="dashboard-error">

          {error}

        </div>

      ) : (

        <>

          {/* =================================================
              RESUMEN
          ================================================= */}

          <div className="potreros-resumen">

            <div>

              <span>
                Total de lotes
              </span>

              <strong>
                {totalLotes}
              </strong>

              <small>
                Registrados
              </small>

            </div>


            <div>

              <span>
                Activos
              </span>

              <strong>
                {activos}
              </strong>

              <small>
                En funcionamiento
              </small>

            </div>


            <div>

              <span>
                Animales
              </span>

              <strong>
                {totalAnimales}
              </strong>

              <small>
                Actualmente asignados
              </small>

            </div>


            <div>

              <span>
                Inactivos
              </span>

              <strong>
                {inactivos}
              </strong>

              <small>
                Fuera de uso
              </small>

            </div>

          </div>


          {/* =================================================
              FILTROS
          ================================================= */}

          <div className="potreros-filtros">

            <div className="buscador-potreros">

              <Search size={17} />

              <input
                type="text"
                placeholder="Buscar lote..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>


            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value
                )
              }
            >

              <option value="todos">
                Todos
              </option>

              <option value="activo">
                Activos
              </option>

              <option value="inactivo">
                Inactivos
              </option>

            </select>

          </div>


          {/* =================================================
              TABLA
          ================================================= */}

          <div className="dashboard-panel">

            <div className="lista-header">

              <div>

                <h3>
                  Lotes registrados
                </h3>

                <span>

                  {
                    lotesFiltrados.length
                  } registros

                </span>

              </div>

            </div>


            {lotesFiltrados.length === 0 ? (

              <div className="estado-vacio">

                <Layers3 size={28} />

                <p>
                  No se encontraron lotes.
                </p>

              </div>

            ) : (

              <div className="tabla-contenedor">

                <table className="tabla-ganatec tabla-apilable" aria-label="Lotes de la finca">

                  <thead>

                    <tr>

                      <th>
                        Lote
                      </th>

                      <th>
                        Descripción
                      </th>

                      <th>
                        Animales
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Acciones
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {lotesFiltrados.map(
                      (lote) => (

                        <tr
                          key={lote.id}
                        >

                          <td data-label="Lote">

                            <strong>

                              {
                                lote.nombre
                              }

                            </strong>

                          </td>


                          <td data-label="Descripción">

                            {
                              lote.descripcion
                              ||
                              "-"
                            }

                          </td>


                          <td data-label="Animales">

                            <div className="lote-total-animales">

                              <Users
                                size={15}
                              />

                              <span>

                                {
                                  Number(
                                    lote.total_animales
                                    ||
                                    0
                                  )
                                }

                              </span>

                            </div>

                          </td>


                          <td data-label="Estado">

                            <span
                              className={
                                `estado-potrero ${
                                  lote.estado
                                  ||
                                  ""
                                }`
                              }
                            >

                              {
                                lote.estado
                              }

                            </span>

                          </td>


                          <td data-label="Acciones">

                            <button
                              type="button"
                              className="boton-tabla"
                              onClick={() =>
                                navigate(
                                  `/potreros/lotes/${lote.id}`
                                )
                              }
                            >

                              Gestionar

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

      )}

    </>

  );

};


export default Lotes;