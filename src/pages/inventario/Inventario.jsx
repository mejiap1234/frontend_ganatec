import ModalGanatec from "../../components/ModalGanatec";
import ProductoNuevo from "./ProductoNuevo";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Boxes,
  PackagePlus,
  Search,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  obtenerInventario,
} from "../../services/inventario.service";


const Inventario = () => {

  const [modalNuevoProducto, setModalNuevoProducto] = useState(false);
  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [productos, setProductos] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [filtro, setFiltro] =
    useState("todos");

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     CARGAR INVENTARIO
  ========================================================= */

  const cargarInventario = async () => {

    try {

      setCargando(true);

      setError("");


      const respuesta =
        await obtenerInventario();


      setProductos(
        Array.isArray(
          respuesta?.productos
        )
          ? respuesta.productos
          : []
      );


    } catch (error) {

      console.error(
        "Error cargando inventario:",
        error
      );


      setError(
        error.response?.data?.message
        ||
        "No fue posible cargar el inventario."
      );


    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarInventario();

  }, []);


  /* =========================================================
     INDICADORES
  ========================================================= */

  const productosActivos =
    productos.filter(
      (producto) =>
        producto.activo
    ).length;


  const productosStockBajo =
    productos.filter(
      (producto) =>
        producto.stock_bajo
        &&
        Number(
          producto.stock_actual
          ||
          0
        ) > 0
    ).length;


  const productosAgotados =
    productos.filter(
      (producto) =>
        Number(
          producto.stock_actual
          ||
          0
        ) <= 0
    ).length;


  /* =========================================================
     FILTRAR PRODUCTOS
  ========================================================= */

  const productosFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .trim()
          .toLowerCase();


      return productos.filter(
        (producto) => {

          const contenido =
            [
              producto.nombre,
              producto.categoria,
              producto.unidad,
              producto.descripcion,
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


          let coincideFiltro =
            true;


          if (
            filtro === "bajo"
          ) {

            coincideFiltro =
              producto.stock_bajo
              &&
              Number(
                producto.stock_actual
                ||
                0
              ) > 0;

          }


          if (
            filtro === "agotado"
          ) {

            coincideFiltro =
              Number(
                producto.stock_actual
                ||
                0
              ) <= 0;

          }


          if (
            filtro === "normal"
          ) {

            coincideFiltro =
              !producto.stock_bajo;

          }


          return (
            coincideBusqueda
            &&
            coincideFiltro
          );

        }
      );

    }, [
      productos,
      busqueda,
      filtro,
    ]);


  /* =========================================================
     ESTADO DEL STOCK
  ========================================================= */

  const obtenerEstadoStock = (
    producto
  ) => {

    const stockActual =
      Number(
        producto.stock_actual
        ||
        0
      );


    if (
      stockActual <= 0
    ) {

      return {
        texto: "Agotado",
        clase: "agotado",
      };

    }


    if (
      producto.stock_bajo
    ) {

      return {
        texto: "Stock bajo",
        clase: "bajo",
      };

    }


    return {
      texto: "Normal",
      clase: "normal",
    };

  };


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <>

      <ModalGanatec abierto={modalNuevoProducto} titulo="Nuevo producto" onClose={() => setModalNuevoProducto(false)}>
        {modalNuevoProducto && (
          <ProductoNuevo modoModal onClose={() => setModalNuevoProducto(false)} onSuccess={() => {
            setModalNuevoProducto(false);
            cargarInventario();
          }} />
        )}
      </ModalGanatec>

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="modulo-subheader">

        <div>

          <h2>
            Inventario
          </h2>

          <p>
            Controla los insumos,
            alimentos, medicamentos
            y demás productos de la finca.
          </p>

        </div>


        <button
          type="button"
          className="boton-principal"
          onClick={() =>
            setModalNuevoProducto(true)
          }
        >

          <PackagePlus size={17} />

          Nuevo producto

        </button>

      </div>


      {/* =====================================================
          CARGA / ERROR
      ===================================================== */}

      {cargando ? (

        <div className="dashboard-loading">

          Cargando inventario...

        </div>

      ) : error ? (

        <div className="dashboard-error">

          {error}

        </div>

      ) : (

        <>

          {/* =================================================
              INDICADORES
          ================================================= */}

          <div className="potreros-resumen">

            <div>

              <span>
                Productos
              </span>

              <strong>
                {productos.length}
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
                {productosActivos}
              </strong>

              <small>
                Disponibles
              </small>

            </div>


            <div>

              <span>
                Stock bajo
              </span>

              <strong>
                {productosStockBajo}
              </strong>

              <small>
                Requieren atención
              </small>

            </div>


            <div>

              <span>
                Agotados
              </span>

              <strong>
                {productosAgotados}
              </strong>

              <small>
                Sin existencia
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
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
              />

            </div>


            <select
              value={filtro}
              onChange={(e) =>
                setFiltro(
                  e.target.value
                )
              }
            >

              <option value="todos">
                Todos
              </option>

              <option value="normal">
                Stock normal
              </option>

              <option value="bajo">
                Stock bajo
              </option>

              <option value="agotado">
                Agotados
              </option>

            </select>

          </div>


          {/* =================================================
              LISTADO
          ================================================= */}

          <div className="dashboard-panel">

            <div className="lista-header">

              <div>

                <h3>
                  Productos
                </h3>

                <span>

                  {
                    productosFiltrados.length
                  } registros

                </span>

              </div>


              <button
                type="button"
                className="boton-secundario"
                onClick={() =>
                  navigate(
                    "/inventario/stock-bajo"
                  )
                }
              >

                <AlertTriangle size={16} />

                Ver stock bajo

              </button>

            </div>


            {productosFiltrados.length === 0 ? (

              <div className="estado-vacio">

                <Boxes size={28} />

                <p>
                  No se encontraron productos.
                </p>

              </div>

            ) : (

              <div className="tabla-contenedor">

                <table className="tabla-ganatec tabla-apilable" aria-label="Productos del inventario">

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
                        Estado
                      </th>

                      <th>
                        Acción
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {productosFiltrados.map(
                      (producto) => {

                        const estadoStock =
                          obtenerEstadoStock(
                            producto
                          );


                        return (

                          <tr
                            key={producto.id}
                          >

                            <td data-label="Producto">

                              <strong>

                                {
                                  producto.nombre
                                }

                              </strong>


                              {producto.descripcion && (

                                <div className="descripcion-tabla">

                                  {
                                    producto.descripcion
                                  }

                                </div>

                              )}

                            </td>


                            <td data-label="Categoría" className="texto-capitalizado">

                              {
                                producto.categoria
                              }

                            </td>


                            <td data-label="Stock actual">

                              <strong>

                                {
                                  Number(
                                    producto.stock_actual
                                    ||
                                    0
                                  )
                                }

                                {" "}

                                {
                                  producto.unidad
                                }

                              </strong>

                            </td>


                            <td data-label="Stock mínimo">

                              {
                                Number(
                                  producto.stock_minimo
                                  ||
                                  0
                                )
                              }

                              {" "}

                              {
                                producto.unidad
                              }

                            </td>


                            <td data-label="Estado">

                              <span
                                className={
                                  `estado-inventario ${estadoStock.clase}`
                                }
                              >

                                {
                                  estadoStock.texto
                                }

                              </span>

                            </td>


                            <td data-label="Acción">

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

                        );

                      }
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


export default Inventario;