import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  DollarSign,
  Plus,
  ReceiptText,
  Scale,
  TrendingUp,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  obtenerMovimientosFinancieros,
  obtenerResumenFinanciero,
} from "../../services/finanzas.service";


const Finanzas = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [resumen, setResumen] =
    useState({
      ingresos_totales: 0,
      gastos_totales: 0,
      balance: 0,
      cantidad_ingresos: 0,
      cantidad_gastos: 0,
    });


  const [movimientos, setMovimientos] =
    useState([]);


  const [cargando, setCargando] =
    useState(true);


  const [error, setError] =
    useState("");


  /* =========================================================
     MES ACTUAL
  ========================================================= */

  const obtenerMesActual = () => {

    const fecha =
      new Date();


    const anio =
      fecha.getFullYear();


    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    return `${anio}-${mes}`;

  };


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
    ).toLocaleDateString(
      "es-CO"
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
     CARGAR FINANZAS
  ========================================================= */

  useEffect(() => {

    const cargarFinanzas =
      async () => {

        try {

          setCargando(true);

          setError("");


          const mesActual =
            obtenerMesActual();


          const [
            respuestaResumen,
            respuestaMovimientos,
          ] =
            await Promise.all([

              obtenerResumenFinanciero({
                mes: mesActual,
              }),

              obtenerMovimientosFinancieros(),

            ]);


          if (
            respuestaResumen?.resumen
          ) {

            setResumen(
              respuestaResumen.resumen
            );

          }


          const listaMovimientos =
            Array.isArray(
              respuestaMovimientos
                ?.movimientos
            )
              ? respuestaMovimientos
                  .movimientos
              : [];


          setMovimientos(
            listaMovimientos.slice(
              0,
              8
            )
          );


        } catch (error) {

          console.error(
            "Error cargando finanzas:",
            error
          );


          setError(
            error.response?.data?.message
            ||
            "No fue posible cargar la información financiera."
          );


        } finally {

          setCargando(false);

        }

      };


    cargarFinanzas();

  }, []);


  /* =========================================================
     CARGANDO
  ========================================================= */

  if (cargando) {

    return (

      <div className="dashboard-loading">

        Cargando finanzas...

      </div>

    );

  }


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <>

      {/* ENCABEZADO */}

      <div className="modulo-subheader">

        <div>

          <h2>
            Finanzas
          </h2>

          <p>
            Controla los ingresos,
            gastos y resultados económicos
            de la finca.
          </p>

        </div>


        <div className="formulario-acciones">

          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                "/finanzas/gasto/nuevo"
              )
            }
          >

            <ReceiptText size={17} />

            Registrar gasto

          </button>


          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                "/finanzas/venta-leche/nueva"
              )
            }
          >

            <DollarSign size={17} />

            Venta de leche

          </button>


          <button
            type="button"
            className="boton-principal"
            onClick={() =>
              navigate(
                "/finanzas/venta-animal/nueva"
              )
            }
          >

            <Plus size={17} />

            Venta de animal

          </button>

        </div>

      </div>


      {error && (

        <div className="dashboard-error">

          {error}

        </div>

      )}


      {/* RESUMEN DEL MES */}

      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="dashboard-card-icon">

            <ArrowUpCircle size={22} />

          </div>

          <div>

            <span>
              Ingresos del mes
            </span>

            <strong>
              {
                formatearDinero(
                  resumen.ingresos_totales
                )
              }
            </strong>

            <small>
              {
                resumen.cantidad_ingresos
              } movimientos
            </small>

          </div>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">

            <ArrowDownCircle size={22} />

          </div>

          <div>

            <span>
              Gastos del mes
            </span>

            <strong>
              {
                formatearDinero(
                  resumen.gastos_totales
                )
              }
            </strong>

            <small>
              {
                resumen.cantidad_gastos
              } movimientos
            </small>

          </div>

        </div>


        <div className="dashboard-card">

          <div className="dashboard-card-icon">

            <TrendingUp size={22} />

          </div>

          <div>

            <span>
              Balance del mes
            </span>

            <strong>
              {
                formatearDinero(
                  resumen.balance
                )
              }
            </strong>

            <small>

              {
                Number(
                  resumen.balance
                ) >= 0
                  ? "Balance positivo"
                  : "Balance negativo"
              }

            </small>

          </div>

        </div>

      </div>


      {/* ACCESOS RÁPIDOS */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <h3>
              Gestión financiera
            </h3>

            <p>
              Registra las principales
              operaciones económicas de la finca.
            </p>

          </div>

        </div>


        <div className="dashboard-grid">

          <button
            type="button"
            className="dashboard-card"
            onClick={() =>
              navigate(
                "/finanzas/gasto/nuevo"
              )
            }
          >

            <ReceiptText size={25} />

            <div>

              <strong>
                Registrar gasto
              </strong>

              <span>
                Alimentación, combustible,
                veterinaria y otros gastos.
              </span>

            </div>

          </button>


          <button
            type="button"
            className="dashboard-card"
            onClick={() =>
              navigate(
                "/finanzas/venta-leche/nueva"
              )
            }
          >

            <DollarSign size={25} />

            <div>

              <strong>
                Venta de leche
              </strong>

              <span>
                Registra litros vendidos,
                precio y comprador.
              </span>

            </div>

          </button>


          <button
            type="button"
            className="dashboard-card"
            onClick={() =>
              navigate(
                "/finanzas/venta-animal/nueva"
              )
            }
          >

            <Scale size={25} />

            <div>

              <strong>
                Venta de animal
              </strong>

              <span>
                Registra una venta y actualiza
                automáticamente el animal.
              </span>

            </div>

          </button>

        </div>

      </div>


      {/* ÚLTIMOS MOVIMIENTOS */}

      <div className="dashboard-panel">

        <div className="panel-header">

          <div>

            <h3>
              Últimos movimientos
            </h3>

            <p>
              Actividad financiera reciente
              de la finca.
            </p>

          </div>


          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              navigate(
                "/finanzas/movimientos"
              )
            }
          >

            Ver todos

            <ArrowRight size={16} />

          </button>

        </div>


        {
          movimientos.length === 0
            ? (

              <div className="estado-vacio">

                Todavía no hay movimientos
                financieros registrados.

              </div>

            )
            : (

              <div className="tabla-contenedor">

                <table className="tabla-dashboard tabla-apilable" aria-label="Movimientos financieros recientes">

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


export default Finanzas;