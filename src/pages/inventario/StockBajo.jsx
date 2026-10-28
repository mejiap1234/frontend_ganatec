import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  PackageX,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  obtenerStockBajo,
} from "../../services/inventario.service";


const StockBajo = () => {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [productos, setProductos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR ALERTAS
  ========================================================= */

  useEffect(() => {

    const cargarAlertas = async () => {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await obtenerStockBajo();


        setProductos(
          Array.isArray(
            respuesta?.productos
          )
            ? respuesta.productos
            : []
        );


      } catch (error) {

        console.error(
          "Error cargando stock bajo:",
          error
        );


        setError(
          error.response?.data?.message
          ||
          "No fue posible cargar las alertas de inventario."
        );


      } finally {

        setCargando(false);

      }

    };


    cargarAlertas();

  }, []);


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
                "/inventario"
              )
            }
          >

            <ArrowLeft size={16} />

            Volver

          </button>


          <h2>
            Stock bajo
          </h2>


          <p>
            Productos que requieren
            revisión o reposición.
          </p>

        </div>

      </div>


      {/* =====================================================
          CARGA / ERROR
      ===================================================== */}

      {cargando ? (

        <div className="dashboard-loading">

          Cargando alertas...

        </div>

      ) : error ? (

        <div className="dashboard-error">

          {error}

        </div>

      ) : (

        <div className="dashboard-panel">

          <div className="lista-header">

            <div>

              <h3>
                Productos con alerta
              </h3>

              <span>

                {
                  productos.length
                } productos requieren atención

              </span>

            </div>

          </div>


          {productos.length === 0 ? (

            <div className="estado-vacio">

              <AlertTriangle size={28} />

              <p>
                No hay productos con
                stock bajo actualmente.
              </p>

            </div>

          ) : (

            <div className="tabla-contenedor">

              <table className="tabla-ganatec">

                <thead>

                  <tr>

                    <th>
                      Producto
                    </th>

                    <th>
                      Categoría
                    </th>

                    <th>
                      Stock actual
                    </th>

                    <th>
                      Stock mínimo
                    </th>

                    <th>
                      Faltante
                    </th>

                    <th>
                      Nivel
                    </th>

                    <th>
                      Acción
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {productos.map(
                    (producto) => (

                      <tr
                        key={producto.id}
                      >

                        <td>

                          <strong>
                            {producto.nombre}
                          </strong>

                        </td>


                        <td className="texto-capitalizado">

                          {producto.categoria}

                        </td>


                        <td>

                          <strong>

                            {
                              Number(
                                producto.stock_actual
                                ||
                                0
                              )
                            }

                            {" "}

                            {producto.unidad}

                          </strong>

                        </td>


                        <td>

                          {
                            Number(
                              producto.stock_minimo
                              ||
                              0
                            )
                          }

                          {" "}

                          {producto.unidad}

                        </td>


                        <td>

                          {
                            Number(
                              producto.cantidad_faltante
                              ||
                              0
                            )
                          }

                          {" "}

                          {producto.unidad}

                        </td>


                        <td>

                          <span
                            className={
                              `estado-inventario ${
                                producto.nivel === "agotado"
                                  ? "agotado"
                                  : "bajo"
                              }`
                            }
                          >

                            {
                              producto.nivel === "agotado"
                                ? "Agotado"
                                : "Stock bajo"
                            }

                          </span>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="boton-tabla"
                            onClick={() =>
                              navigate(
                                `/inventario/${producto.id}`
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

      )}

    </>

  );

};


export default StockBajo;