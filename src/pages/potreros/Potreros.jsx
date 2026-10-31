import ModalGanatec from "../../components/ModalGanatec";
import PotreroNuevo from "./potrero/PotreroNuevo";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Map,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  obtenerPotreros,
} from "../../services/potreros/potreros.service";


const Potreros = () => {

  const [modalNuevoPotrero, setModalNuevoPotrero] = useState(false);
  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [potreros, setPotreros] =
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
     CARGAR POTREROS
  ========================================================= */

  const cargarPotreros = async () => {

    try {

      setCargando(true);
      setError("");


      const respuesta =
        await obtenerPotreros();


      const lista =
        Array.isArray(
          respuesta?.potreros
        )
          ? respuesta.potreros
          : Array.isArray(respuesta)
            ? respuesta
            : [];


      setPotreros(lista);


    } catch (error) {

      console.error(
        "Error cargando potreros:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible cargar los potreros."
      );


    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarPotreros();

  }, []);


  /* =========================================================
     INDICADORES
  ========================================================= */

  const total =
    potreros.length;


  const disponibles =
    potreros.filter(
      (potrero) =>
        potrero.estado === "disponible"
    ).length;


  const ocupados =
    potreros.filter(
      (potrero) =>
        potrero.estado === "ocupado"
    ).length;


  const descanso =
    potreros.filter(
      (potrero) =>
        potrero.estado === "descanso"
    ).length;


  /* =========================================================
     FILTROS
  ========================================================= */

  const potrerosFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      return potreros.filter(
        (potrero) => {

          const coincideEstado =
            filtroEstado === "todos"
            ||
            potrero.estado === filtroEstado;


          const contenido =
            [
              potrero.nombre,
              potrero.tipo_pasto,
              potrero.estado,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return (
            coincideEstado
            &&
            (
              !texto
              ||
              contenido.includes(texto)
            )
          );

        }
      );

    }, [
      potreros,
      busqueda,
      filtroEstado,
    ]);


  return (

    <>

      <ModalGanatec abierto={modalNuevoPotrero} titulo="Nuevo potrero" onClose={() => setModalNuevoPotrero(false)}>
        {modalNuevoPotrero && (
          <PotreroNuevo modoModal onClose={() => setModalNuevoPotrero(false)} onSuccess={() => {
            setModalNuevoPotrero(false);
            cargarPotreros();
          }} />
        )}
      </ModalGanatec>

      {/* =====================================================
          ENCABEZADO INTERNO
      ===================================================== */}

      <div className="modulo-subheader">

        <div>

          <h2>
            Potreros
          </h2>

          <p>
            Consulta disponibilidad, ocupación
            y períodos de descanso.
          </p>

        </div>


        <button
          type="button"
          className="boton-principal"
          onClick={() =>
            setModalNuevoPotrero(true)
          }
        >

          <Plus size={17} />

          Nuevo potrero

        </button>

      </div>


      {cargando ? (

        <div className="dashboard-loading">
          Cargando potreros...
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
                Total
              </span>

              <strong>
                {total}
              </strong>

              <small>
                Potreros registrados
              </small>

            </div>


            <div>

              <span>
                Disponibles
              </span>

              <strong>
                {disponibles}
              </strong>

              <small>
                Listos para uso
              </small>

            </div>


            <div>

              <span>
                Ocupados
              </span>

              <strong>
                {ocupados}
              </strong>

              <small>
                Con lotes actualmente
              </small>

            </div>


            <div>

              <span>
                En descanso
              </span>

              <strong>
                {descanso}
              </strong>

              <small>
                Recuperación de pastura
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
                placeholder="Buscar potrero..."
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

              <option value="disponible">
                Disponibles
              </option>

              <option value="ocupado">
                Ocupados
              </option>

              <option value="descanso">
                En descanso
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
                  Potreros registrados
                </h3>

                <span>
                  {potrerosFiltrados.length} registros
                </span>

              </div>

            </div>


            {potrerosFiltrados.length === 0 ? (

              <p className="texto-secundario">
                No se encontraron potreros.
              </p>

            ) : (

              <div className="tabla-contenedor">

                <table className="tabla-ganatec">

                  <thead>

                    <tr>

                      <th>
                        Potrero
                      </th>

                      <th>
                        Área
                      </th>

                      <th>
                        Tipo de pasto
                      </th>

                      <th>
                        Capacidad
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

                    {potrerosFiltrados.map(
                      (potrero) => (

                        <tr key={potrero.id}>

                          <td>

                            <strong>
                              {potrero.nombre}
                            </strong>

                            {potrero.observacion && (

                              <div className="descripcion-tabla">
                                {potrero.observacion}
                              </div>

                            )}

                          </td>


                          <td>

                            {
                              potrero.area_hectareas
                                ? `${Number(
                                    potrero.area_hectareas
                                  )} ha`
                                : "-"
                            }

                          </td>


                          <td>

                            {
                              potrero.tipo_pasto
                              ||
                              "-"
                            }

                          </td>


                          <td>

                            {
                              potrero.capacidad_animales
                                ? `${potrero.capacidad_animales} animales`
                                : "-"
                            }

                          </td>


                          <td>

                            <span
                              className={
                                `estado-potrero ${
                                  potrero.estado || ""
                                }`
                              }
                            >

                              {potrero.estado}

                            </span>

                          </td>


                          <td>

                            <button
                              type="button"
                              className="boton-tabla"
                              onClick={() =>
                                navigate(
                                  `/potreros/${potrero.id}`
                                )
                              }
                            >

                              <Map size={14} />

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


export default Potreros;