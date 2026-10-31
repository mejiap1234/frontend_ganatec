import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Search,
  RotateCcw,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  obtenerMovimientosFinancieros,
} from "../../services/finanzas.service";


const MovimientosFinancieros = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [
    movimientos,
    setMovimientos,
  ] = useState([]);


  const [filtros, setFiltros] =
    useState({
      tipo: "",
      categoria: "",
      desde: "",
      hasta: "",
    });


  const [cargando, setCargando] =
    useState(true);


  const [error, setError] =
    useState("");


  /* =========================================================
     FORMATEAR DINERO
  ========================================================= */

  const formatearDinero = (
    valor
  ) => {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(valor || 0)
    );

  };


  /* =========================================================
     FORMATEAR FECHA
  ========================================================= */

  const formatearFecha = (
    fecha
  ) => {

    if (!fecha) {
      return "-";
    }


    return new Date(
      fecha
    ).toLocaleString(
      "es-CO",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );

  };


  /* =========================================================
     NOMBRE DE CATEGORÍA
  ========================================================= */

  const nombreCategoria = (
    categoria
  ) => {

    const nombres = {

      venta_leche:
        "Venta de leche",

      venta_animal:
        "Venta de animal",

      veterinario:
        "Veterinario",

      combustible:
        "Combustible",

      mantenimiento:
        "Mantenimiento",

      transporte:
        "Transporte",

      servicios:
        "Servicios",

      mano_obra:
        "Mano de obra",

      alimentacion:
        "Alimentación",

      medicamentos:
        "Medicamentos",

      infraestructura:
        "Infraestructura",

      otro:
        "Otro",

    };


    return (
      nombres[categoria]
      ||
      categoria
      ||
      "Sin categoría"
    );

  };


  /* =========================================================
     CARGAR MOVIMIENTOS
  ========================================================= */

  const cargarMovimientos =
    async (
      filtrosActuales = filtros
    ) => {

      try {

        setCargando(true);

        setError("");


        const parametros = {};


        if (
          filtrosActuales.tipo
        ) {

          parametros.tipo =
            filtrosActuales.tipo;

        }


        if (
          filtrosActuales.categoria
        ) {

          parametros.categoria =
            filtrosActuales.categoria;

        }


        if (
          filtrosActuales.desde
        ) {

          parametros.desde =
            filtrosActuales.desde;

        }


        if (
          filtrosActuales.hasta
        ) {

          parametros.hasta =
            filtrosActuales.hasta;

        }


        const respuesta =
          await obtenerMovimientosFinancieros(
            parametros
          );


        const lista =
          Array.isArray(
            respuesta?.movimientos
          )
            ? respuesta.movimientos
            : [];


        setMovimientos(
          lista
        );


      } catch (error) {

        console.error(
          "Error cargando movimientos:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible consultar los movimientos financieros."
        );


      } finally {

        setCargando(false);

      }

    };


  /* =========================================================
     CARGA INICIAL
  ========================================================= */

  useEffect(() => {

    cargarMovimientos({
      tipo: "",
      categoria: "",
      desde: "",
      hasta: "",
    });

  }, []);


  /* =========================================================
     CAMBIAR FILTROS
  ========================================================= */

  const manejarCambio =
    (e) => {

      const {
        name,
        value,
      } = e.target;


      setFiltros(
        (anterior) => ({
          ...anterior,
          [name]: value,
        })
      );

    };


  /* =========================================================
     APLICAR FILTROS
  ========================================================= */

  const manejarBuscar =
    (e) => {

      e.preventDefault();

      cargarMovimientos(
        filtros
      );

    };


  /* =========================================================
     LIMPIAR FILTROS
  ========================================================= */

  const limpiarFiltros = () => {

    const vacios = {
      tipo: "",
      categoria: "",
      desde: "",
      hasta: "",
    };


    setFiltros(
      vacios
    );


    cargarMovimientos(
      vacios
    );

  };


  /* =========================================================
     TOTALES VISIBLES
  ========================================================= */

  const ingresos =
    movimientos
      .filter(
        (movimiento) =>
          movimiento.tipo ===
          "ingreso"
      )
      .reduce(
        (total, movimiento) =>
          total
          +
          Number(
            movimiento.monto
            ||
            0
          ),
        0
      );


  const gastos =
    movimientos
      .filter(
        (movimiento) =>
          movimiento.tipo ===
          "gasto"
      )
      .reduce(
        (total, movimiento) =>
          total
          +
          Number(
            movimiento.monto
            ||
            0
          ),
        0
      );


  const balance =
    ingresos - gastos;


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <>

      {/* ENCABEZADO */}

      <div className="modulo-subheader">

        <div>

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                "/finanzas"
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Movimientos financieros
          </h2>


          <p>
            Consulta los ingresos y gastos
            registrados en la finca.
          </p>

        </div>

      </div>


      {/* FILTROS */}

      <div className="dashboard-panel">

        <form
          onSubmit={manejarBuscar}
        >

          <div className="form-grid">


            {/* TIPO */}

            <div className="campo-formulario">

              <label>
                Tipo
              </label>


              <select
                name="tipo"
                value={
                  filtros.tipo
                }
                onChange={manejarCambio}
              >

                <option value="">
                  Todos
                </option>

                <option value="ingreso">
                  Ingresos
                </option>

                <option value="gasto">
                  Gastos
                </option>

              </select>

            </div>


            {/* CATEGORÍA */}

            <div className="campo-formulario">

              <label>
                Categoría
              </label>


              <select
                name="categoria"
                value={
                  filtros.categoria
                }
                onChange={manejarCambio}
              >

                <option value="">
                  Todas
                </option>

                <option value="venta_leche">
                  Venta de leche
                </option>

                <option value="venta_animal">
                  Venta de animal
                </option>

                <option value="alimentacion">
                  Alimentación
                </option>

                <option value="medicamentos">
                  Medicamentos
                </option>

                <option value="veterinario">
                  Veterinario
                </option>

                <option value="combustible">
                  Combustible
                </option>

                <option value="mantenimiento">
                  Mantenimiento
                </option>

                <option value="transporte">
                  Transporte
                </option>

                <option value="servicios">
                  Servicios
                </option>

                <option value="mano_obra">
                  Mano de obra
                </option>

                <option value="infraestructura">
                  Infraestructura
                </option>

                <option value="otro">
                  Otro
                </option>

              </select>

            </div>


            {/* DESDE */}

            <div className="campo-formulario">

              <label>
                Desde
              </label>

              <input
                type="date"
                name="desde"
                value={
                  filtros.desde
                }
                onChange={manejarCambio}
              />

            </div>


            {/* HASTA */}

            <div className="campo-formulario">

              <label>
                Hasta
              </label>

              <input
                type="date"
                name="hasta"
                value={
                  filtros.hasta
                }
                onChange={manejarCambio}
              />

            </div>

          </div>


          <div className="formulario-acciones">

            <button
              type="button"
              className="boton-secundario"
              onClick={limpiarFiltros}
            >

              <RotateCcw size={16} />

              Limpiar

            </button>


            <button
              type="submit"
              className="boton-principal"
            >

              <Search size={16} />

              Buscar

            </button>

          </div>

        </form>

      </div>


      {/* RESUMEN DE LOS RESULTADOS */}

      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div>

            <span>
              Ingresos
            </span>

            <strong>
              {
                formatearDinero(
                  ingresos
                )
              }
            </strong>

          </div>

        </div>


        <div className="dashboard-card">

          <div>

            <span>
              Gastos
            </span>

            <strong>
              {
                formatearDinero(
                  gastos
                )
              }
            </strong>

          </div>

        </div>


        <div className="dashboard-card">

          <div>

            <span>
              Balance
            </span>

            <strong>
              {
                formatearDinero(
                  balance
                )
              }
            </strong>

          </div>

        </div>

      </div>


      {/* MOVIMIENTOS */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <h3>
              Historial financiero
            </h3>

            <p>
              {
                movimientos.length
              } movimientos encontrados.
            </p>

          </div>

        </div>


        {error && (

          <div className="dashboard-error">

            {error}

          </div>

        )}


        {
          cargando
            ? (

              <div className="dashboard-loading">

                Cargando movimientos...

              </div>

            )
            : movimientos.length === 0
              ? (

                <div className="estado-vacio">

                  No se encontraron movimientos
                  con los filtros seleccionados.

                </div>

              )
              : (

                <div className="tabla-contenedor">

                  <table className="tabla-dashboard tabla-apilable" aria-label="Historial de movimientos financieros">

                    <thead>

                      <tr>

                        <th>
                          Fecha
                        </th>

                        <th>
                          Tipo
                        </th>

                        <th>
                          Categoría
                        </th>

                        <th>
                          Descripción
                        </th>

                        <th>
                          Registrado por
                        </th>

                        <th>
                          Valor
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {
                        movimientos.map(
                          (movimiento) => (

                            <tr
                              key={
                                movimiento.id
                              }
                            >

                              <td data-label="Fecha">

                                {
                                  formatearFecha(
                                    movimiento.fecha_movimiento
                                  )
                                }

                              </td>


                              <td data-label="Tipo">

                                {
                                  movimiento.tipo ===
                                  "ingreso"
                                    ? "Ingreso"
                                    : "Gasto"
                                }

                              </td>


                              <td data-label="Categoría">

                                {
                                  nombreCategoria(
                                    movimiento.categoria
                                  )
                                }

                              </td>


                              <td data-label="Descripción">

                                {
                                  movimiento.descripcion
                                  ||
                                  "-"
                                }

                              </td>


                              <td data-label="Registrado por">

                                {
                                  movimiento.registrado_por_nombre
                                  ||
                                  "-"
                                }

                              </td>


                              <td data-label="Valor">

                                <strong>

                                  {
                                    movimiento.tipo ===
                                    "ingreso"
                                      ? "+"
                                      : "-"
                                  }

                                  {
                                    formatearDinero(
                                      movimiento.monto
                                    )
                                  }

                                </strong>

                              </td>

                            </tr>

                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>

              )
        }

      </div>

    </>

  );

};


export default MovimientosFinancieros;