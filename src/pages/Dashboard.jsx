import {
  useEffect,
  useState
} from "react";

import { GiCow } from "react-icons/gi";

import {
  Dna,
  Milk,
  WalletCards,
  HeartPulse,
  Package,
  Map,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle
} from "lucide-react";

import DashboardLayout
  from "../layouts/DashboardLayout";

import {
  obtenerDashboard
} from "../services/dashboard.service";


const Dashboard = () => {

  const [
    datos,
    setDatos
  ] = useState(null);

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");


  useEffect(() => {

    const cargarDashboard =
      async () => {

        try {

          const respuesta =
            await obtenerDashboard();

          setDatos(respuesta);

        } catch (error) {

          console.error(error);

          setError(
            "No fue posible cargar el dashboard"
          );

        } finally {

          setCargando(false);

        }

      };


    cargarDashboard();

  }, []);


  if (cargando) {

    return (

      <DashboardLayout>

        <div className="dashboard-loading">
          Cargando información de la finca...
        </div>

      </DashboardLayout>

    );

  }


  if (error) {

    return (

      <DashboardLayout>

        <div className="dashboard-error">
          {error}
        </div>

      </DashboardLayout>

    );

  }


  const tendencia =
    datos?.leche?.tendencia;


  const IconoTendencia =
    tendencia === "subiendo"
      ? TrendingUp
      : tendencia === "bajando"
        ? TrendingDown
        : Minus;


  return (

    <DashboardLayout>

      {/* ENCABEZADO */}

      <section className="dashboard-heading">

        <div>

          <p className="dashboard-label">
            Resumen general
          </p>

          <h1>
            {
              datos?.finca?.nombre
              ||
              "Mi finca"
            }
          </h1>

          <p>
            Estado actualizado de tu operación ganadera.
          </p>

        </div>


        <div
          className={
            `estado-finca ${
              datos?.estado_general
                ?.estado
            }`
          }
        >

          <span />

          {
            datos?.estado_general
              ?.estado ===
              "requiere_atencion"
              ? "Requiere atención"

              : datos
                  ?.estado_general
                  ?.estado === "atencion"
                ? "Atención"

                : datos
                    ?.estado_general
                    ?.estado === "seguimiento"
                  ? "En seguimiento"

                  : "Todo estable"
          }

        </div>

      </section>


      {/* TARJETAS PRINCIPALES */}

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
             <GiCow size={24} />
          </div>

          <div>

            <span>
              Animales activos
            </span>

            <strong>
              {
                datos?.animales
                  ?.activos ?? 0
              }
            </strong>

            <small>
              {
                datos?.animales
                  ?.total ?? 0
              } registrados
            </small>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            <Dna />
          </div>

          <div>

            <span>
              Gestaciones
            </span>

            <strong>
              {
                datos?.reproduccion
                  ?.gestaciones_activas
                ?? 0
              }
            </strong>

            <small>
              {
                datos?.reproduccion
                  ?.partos_30_dias
                ?? 0
              } partos próximos
            </small>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            <Milk />
          </div>

          <div>

            <span>
              Leche este mes
            </span>

            <strong>
              {
                datos?.leche
                  ?.litros_mes ?? 0
              } L
            </strong>

           <small>
            Hoy: {
            datos?.leche
            ?.litros_hoy ?? 0
             } L
            </small>

          </div>

        </div>


        {
          datos?.finanzas && (

            <div className="stat-card">

              <div className="stat-icon">
                <WalletCards />
              </div>

              <div>

                <span>
                  Balance del mes
                </span>

                <strong>
                  $
                  {
                    Number(
                      datos.finanzas
                        .balance_mes
                    )
                      .toLocaleString(
                        "es-CO"
                      )
                  }
                </strong>

                <small>
                  Ingresos menos gastos
                </small>

              </div>

            </div>

          )
        }

      </section>


      {/* CUERPO */}

      <section className="dashboard-grid">

        {/* ALERTAS */}

        <div className="dashboard-panel alertas-panel">

          <div className="panel-header">

            <div>

              <span className="panel-label">
                Prioridades
              </span>

              <h3>
                Requiere tu atención
              </h3>

            </div>

            <div className="badge-alertas">

              <Bell size={15} />

              {
                datos
                  ?.estado_general
                  ?.total_alertas ?? 0
              }

            </div>

          </div>


          {
            datos?.alertas?.length > 0
              ? (

                <div className="alertas-lista">

                  {
                    datos.alertas.map(
                      alerta => (

                        <div
                          key={alerta.id}
                          className={
                            `alerta-item ${alerta.prioridad}`
                          }
                        >

                          <div className="alerta-icono">

                            <AlertTriangle
                              size={18}
                            />

                          </div>

                          <div>

                            <strong>
                              {
                                alerta.titulo
                              }
                            </strong>

                            <p>
                              {
                                alerta.mensaje
                              }
                            </p>

                            <small>
                              {
                                alerta.prioridad
                              }
                            </small>

                          </div>

                        </div>

                      )
                    )
                  }

                </div>

              )
              : (

                <div className="sin-alertas">

                  No hay alertas pendientes.

                </div>

              )
          }

        </div>


        {/* OPERACIÓN */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <span className="panel-label">
                Operación
              </span>

              <h3>
                Estado productivo
              </h3>

            </div>

          </div>


          <div className="operacion-lista">

            <div>

              <HeartPulse />

              <span>
                Eventos de salud abiertos
              </span>

              <strong>
                {
                  datos?.salud
                    ?.eventos_abiertos ?? 0
                }
              </strong>

            </div>


            <div>

              <Package />

              <span>
                Productos con stock bajo
              </span>

              <strong>
                {
                  datos?.inventario
                    ?.stock_bajo ?? 0
                }
              </strong>

            </div>


            <div>

              <Map />

              <span>
                Potreros ocupados
              </span>

              <strong>
                {
                  datos?.potreros
                    ?.ocupados ?? 0
                }
              </strong>

            </div>


            <div>

              <Milk />

              <span>
                Litros últimos 7 días
              </span>

              <strong>
                {
                  datos?.leche
                    ?.ultimos_7_dias ?? 0
                } L
              </strong>

            </div>

          </div>

        </div>

      </section>

    </DashboardLayout>

  );

};


export default Dashboard;