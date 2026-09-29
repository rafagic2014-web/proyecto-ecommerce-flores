import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { PaisContext } from '../context/pais-context';
import { useSesion } from '../hooks/useSesion';
import { convertirPrecio, fmt, getMoneda } from '../lib/moneda';
import Icon from '../components/Icon';
import '../css/admin.css';

const VACIO = {
  nombre: '',
  precio: '',
  stock: '',
  descripcion: '',
  imagen: '',
  categoria_id: '',
};

/** Fecha y hora del pedido, en formato local corto. */
function fechaCorta(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/**
 * Axios solo rellena `err.response` si el servidor llegó a contestar.
 * Con el backend apagado la petición ni sale, no hay respuesta y el
 * `mensaje` del servidor no existe, así que el panel acababa enseñando
 * un texto genérico indistinguible de un fallo real del endpoint. Aquí
 * se separan los dos casos.
 */
function errorDe(err, porDefecto) {
  if (!err.response) {
    return 'No hay conexión con el servidor. ¿Está el backend arrancado?';
  }
  return err.response.data?.mensaje || porDefecto;
}

export default function Admin() {
  const { token, user, cerrarSesion } = useSesion();
  const { paisSeleccionado } = useContext(PaisContext);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [producto, setProducto] = useState(VACIO);
  const [editando, setEditando] = useState(null);
  const [categoria, setCategoria] = useState({ nombre: '', estado_activo: 1 });

  const [tab, setTab] = useState('productos');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Filtros del panel de usuarios
  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [guardandoUsuario, setGuardandoUsuario] = useState(null);

  // Filtro de estado del catálogo: permite ver lo desactivado
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Panel de pedidos
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [buscaPedido, setBuscaPedido] = useState('');
  const [pedidoAbierto, setPedidoAbierto] = useState(null);

  const moneda = getMoneda(paisSeleccionado);
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  // No toca `cargando` al entrar: el estado inicial ya es true.
  // Así el efecto no dispara un setState sincrónico al montar.
  const cargar = useCallback(async () => {
    try {
      // /productos/admin devuelve también los desactivados; /productos
      // los filtra, y el panel necesita verlos para poder reactivarlos.
      const [pRes, cRes] = await Promise.all([
        api.get('/productos/admin', config),
        api.get('/categorias', config),
      ]);
      setProductos(pRes.data || []);
      setCategorias(cRes.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos del panel.');
    } finally {
      setCargando(false);
    }
  }, [config]);

  const refrescar = useCallback(async () => {
    setCargando(true);
    await cargar();
  }, [cargar]);

  // El acceso ya lo garantiza RutaPrivada en la ruta /admin,
  // así que aquí solo se cargan los datos al entrar.
  useEffect(() => {
    const cargarAlEntrar = async () => {
      await cargar();
    };

    cargarAlEntrar();
  }, [cargar]);

  // Filtros del panel de usuarios.
  const usuariosVisibles = useMemo(() => {
    const q = buscaUsuario.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (filtroRol === 'admins' && u.rol !== 'admin') return false;
      if (filtroRol === 'clientes' && u.rol !== 'cliente') return false;
      if (filtroRol === 'inactivos' && u.estado_activo !== 0) return false;
      if (!q) return true;
      return (
        u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    });
  }, [usuarios, buscaUsuario, filtroRol]);

  // Cuántos administradores activos quedan: impide quedarse sin panel
  const adminsActivos = useMemo(
    () => usuarios.filter((u) => u.rol === 'admin' && u.estado_activo === 1).length,
    [usuarios]
  );

  // Productos según el filtro de estado
  const productosVisibles = useMemo(() => {
    if (filtroEstado === 'activos') return productos.filter((p) => p.estado_activo === 1);
    if (filtroEstado === 'inactivos') return productos.filter((p) => p.estado_activo === 0);
    return productos;
  }, [productos, filtroEstado]);

  const inactivos = useMemo(
    () => productos.filter((p) => p.estado_activo === 0).length,
    [productos]
  );

  // Pedidos según la búsqueda: por número, por cliente o por producto.
  const pedidosVisibles = useMemo(() => {
    const q = buscaPedido.trim().toLowerCase();
    if (!q) return pedidos;

    return pedidos.filter((p) => {
      if (String(p.id) === q) return true;

      const textos = [
        p.nombre_cliente,
        p.usuario_nombre,
        p.usuario_email,
        p.cedula,
        p.pais,
      ];

      if (textos.some((t) => t?.toLowerCase().includes(q))) return true;

      return p.detalle?.some((d) => d.nombre?.toLowerCase().includes(q));
    });
  }, [pedidos, buscaPedido]);

  /*
   * Total cobrado, agrupado por moneda.
   *
   * No se convierte nada: cada pedido se cobró en la moneda que eligió el
   * cliente, así que sumar importes de monedas distintas daría una cifra
   * sin sentido. Se muestra una entrada por moneda.
   */
  const ingresosPorMoneda = useMemo(() => {
    const totales = new Map();

    for (const p of pedidos) {
      const m = p.moneda || 'USD';
      totales.set(m, (totales.get(m) || 0) + Number(p.total || 0));
    }

    return [...totales.entries()];
  }, [pedidos]);

  const avisar = (texto) => {
    setMsg(texto);
    setError('');
    window.setTimeout(() => setMsg(''), 3000);
  };

  // ============================
  //  PRODUCTOS
  // ============================
  const guardarProducto = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');

    try {
      if (editando) {
        await api.put(`/productos/${editando}`, producto, config);
        avisar('Producto actualizado.');
      } else {
        await api.post('/productos', producto, config);
        avisar('Producto creado.');
      }
      setProducto(VACIO);
      setEditando(null);
      await refrescar();
    } catch (err) {
      setError(errorDe(err, 'No se pudo guardar el producto.'));
    } finally {
      setEnviando(false);
    }
  };

  const editar = (p) => {
    setEditando(p.id);
    setProducto({
      nombre: p.nombre ?? '',
      precio: p.precio ?? '',
      stock: p.stock ?? '',
      descripcion: p.descripcion ?? '',
      imagen: p.imagen ?? '',
      categoria_id: p.categoria_id ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setProducto(VACIO);
  };

  const borrar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await api.delete(`/productos/${p.id}`, config);
      if (editando === p.id) cancelarEdicion();
      await refrescar();
    } catch (err) {
      setError(errorDe(err, 'No se pudo eliminar el producto.'));
    }
  };

  /** Devuelve al catálogo un producto que estaba desactivado. */
  const reactivar = async (p) => {
    try {
      await api.put(`/productos/activar/${p.id}`, {}, config);
      await refrescar();
      avisar(`"${p.nombre}" volvió al catálogo.`);
    } catch (err) {
      setError(errorDe(err, 'No se pudo reactivar el producto.'));
    }
  };

  // ============================
  //  CATEGORÍAS
  // ============================
  const crearCategoria = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');

    try {
      await api.post('/categorias', categoria, config);
      setCategoria({ nombre: '', estado_activo: 1 });
      await refrescar();
      avisar('Categoría creada.');
    } catch (err) {
      setError(errorDe(err, 'No se pudo crear la categoría.'));
    } finally {
      setEnviando(false);
    }
  };

  const borrarCategoria = async (c) => {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    try {
      await api.delete(`/categorias/${c.id}`, config);
      await refrescar();
    } catch (err) {
      setError(errorDe(err, 'No se pudo eliminar la categoría.'));
    }
  };

  // ============================
  //  PEDIDOS
  // ============================
  const cargarPedidos = async () => {
    setCargandoPedidos(true);
    setError('');

    try {
      const res = await api.get('/pedidos', config);
      setPedidos(res.data || []);
    } catch (err) {
      console.error(err);
      setError(errorDe(err, 'No se pudieron cargar los pedidos.'));
    } finally {
      setCargandoPedidos(false);
    }
  };

  // ============================
  //  USUARIOS
  // ============================
  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/auth/usuarios', config);
      setUsuarios(res.data || []);
    } catch (err) {
      console.error(err);
      setError(errorDe(err, 'No se pudieron cargar los usuarios.'));
    }
  };

  const actualizarUsuario = async (u, cambios, texto) => {
    setGuardandoUsuario(u.id);
    setError('');

    try {
      await api.patch(`/auth/usuarios/${u.id}`, cambios, config);
      await cargarUsuarios();
      avisar(texto);
    } catch (err) {
      setError(errorDe(err, 'No se pudo actualizar el usuario.'));
    } finally {
      setGuardandoUsuario(null);
    }
  };

  const alternarRol = (u) => {
    const nuevoRol = u.rol === 'admin' ? 'cliente' : 'admin';
    const propia = Number(u.id) === Number(user?.id);

    if (propia && nuevoRol === 'cliente') {
      setError('No puedes quitarte a ti mismo el rol de administrador.');
      return;
    }

    if (u.rol === 'admin' && adminsActivos === 1) {
      setError('Debe quedar al menos un administrador activo.');
      return;
    }

    const verificar = window.confirm(
      nuevoRol === 'admin'
        ? `¿Dar permisos de administrador a "${u.nombre}"? Podrá gestionar productos, categorías y usuarios.`
        : `¿Quitar el rol de administrador a "${u.nombre}"?`
    );
    if (!verificar) return;

    actualizarUsuario(u, { rol: nuevoRol }, nuevoRol === 'admin' ? 'Rol actualizado.' : 'Rol retirado.');
  };

  const alternarEstado = (u) => {
    const activar = u.estado_activo === 0;

    if (!activar && Number(u.id) === Number(user?.id)) {
      setError('No puedes desactivar tu propia cuenta.');
      return;
    }

    if (!activar && u.rol === 'admin' && adminsActivos === 1) {
      setError('Debe quedar al menos un administrador activo.');
      return;
    }

    const verificar = window.confirm(
      activar
        ? `¿Reactivar la cuenta de "${u.nombre}"? Podrá volver a iniciar sesión.`
        : `¿Desactivar la cuenta de "${u.nombre}"? No podrá iniciar sesión hasta reactivarla.`
    );
    if (!verificar) return;

    actualizarUsuario(
      u,
      { estado_activo: activar ? 1 : 0 },
      activar ? 'Cuenta reactivada.' : 'Cuenta desactivada.'
    );
  };

  // ============================
  //  VISTA
  // ============================
  return (
    <div className="page">
      <div className="container">
        <header className="page-head admin-head">
          <div>
            <p className="eyebrow">Panel de administración</p>
            <h1 className="page-title">Gestión de catálogo</h1>
            <p className="page-subtitle">
              {user?.nombre ? `Sesión de ${user.nombre}` : 'Sesión de administrador'} ·{' '}
              {productos.length} productos · {categorias.length} categorías
            </p>
          </div>

          <button className="btn btn-secondary" onClick={cerrarSesion}>
            <Icon name="logout" size={15} />
            <span>Cerrar sesión</span>
          </button>
        </header>

        {error && (
          <p className="form-alert admin-alert" role="alert">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </p>
        )}

        {msg && (
          <p className="form-alert form-alert-success admin-alert" role="status">
            <Icon name="checkCircle" size={16} />
            <span>{msg}</span>
          </p>
        )}

        {/* ---------- Tabs ---------- */}
        <div className="admin-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'productos'}
            className={`admin-tab${tab === 'productos' ? ' is-active' : ''}`}
            onClick={() => setTab('productos')}
          >
            <Icon name="package" size={15} />
            <span>Productos</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'categorias'}
            className={`admin-tab${tab === 'categorias' ? ' is-active' : ''}`}
            onClick={() => setTab('categorias')}
          >
            <Icon name="settings" size={15} />
            <span>Categorías</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'pedidos'}
            className={`admin-tab${tab === 'pedidos' ? ' is-active' : ''}`}
            onClick={() => {
              setTab('pedidos');
              cargarPedidos();
            }}
          >
            <Icon name="box" size={15} />
            <span>Pedidos</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'usuarios'}
            className={`admin-tab${tab === 'usuarios' ? ' is-active' : ''}`}
            onClick={() => {
              setTab('usuarios');
              cargarUsuarios();
            }}
          >
            <Icon name="users" size={15} />
            <span>Usuarios</span>
          </button>
        </div>

        {tab === 'productos' ? (
          <>
            {/* ---------- Formulario ---------- */}
            <section className="card admin-form-card">
              <div className="card-head">
                <h2 className="card-title">
                  {editando ? `Editar: ${producto.nombre || 'producto'}` : 'Nuevo producto'}
                </h2>
                {editando && (
                  <button className="btn btn-ghost btn-sm" onClick={cancelarEdicion}>
                    <Icon name="x" size={14} />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>

              <form className="card-body form-grid" onSubmit={guardarProducto}>
                <div className="field form-grid-full">
                  <label className="label" htmlFor="p-nombre">
                    Nombre
                  </label>
                  <input
                    id="p-nombre"
                    className="input"
                    required
                    placeholder="Ramo de rosas"
                    value={producto.nombre}
                    onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="p-precio">
                    Precio
                  </label>
                  <input
                    id="p-precio"
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="25.00"
                    value={producto.precio}
                    onChange={(e) => setProducto({ ...producto, precio: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="p-stock">
                    Stock
                  </label>
                  <input
                    id="p-stock"
                    className="input"
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={producto.stock}
                    onChange={(e) => setProducto({ ...producto, stock: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="p-categoria">
                    Categoría
                  </label>
                  <select
                    id="p-categoria"
                    className="select"
                    value={producto.categoria_id}
                    onChange={(e) => setProducto({ ...producto, categoria_id: e.target.value })}
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label" htmlFor="p-imagen">
                    URL de imagen
                  </label>
                  <input
                    id="p-imagen"
                    className="input"
                    placeholder="/img/rosas.jpg"
                    value={producto.imagen}
                    onChange={(e) => setProducto({ ...producto, imagen: e.target.value })}
                  />
                </div>

                <div className="field form-grid-full">
                  <label className="label" htmlFor="p-desc">
                    Descripción
                  </label>
                  <textarea
                    id="p-desc"
                    className="textarea"
                    rows="3"
                    placeholder="Describe el producto…"
                    value={producto.descripcion}
                    onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })}
                  />
                </div>

                <div className="form-grid-full">
                  <button className="btn btn-primary" type="submit" disabled={enviando}>
                    {enviando ? (
                      <>
                        <span className="spinner spinner-inverse" />
                        <span>Guardando…</span>
                      </>
                    ) : (
                      <>
                        <Icon name={editando ? 'check' : 'plus'} size={15} />
                        <span>{editando ? 'Guardar cambios' : 'Crear producto'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* ---------- Tabla ---------- */}
            <section className="card admin-table-card">
              <div className="card-head">
                <h2 className="card-title">Productos</h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={refrescar}
                  disabled={cargando}
                  aria-label="Recargar"
                >
                  <Icon name="refresh" size={15} />
                  <span>Actualizar</span>
                </button>
              </div>

              <div className="card-body admin-user-filters">
                <div className="field">
                  <label className="label" htmlFor="p-filtro-estado">
                    Filtrar por estado
                  </label>
                  <select
                    id="p-filtro-estado"
                    className="select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="todos">Todos ({productos.length})</option>
                    <option value="activos">
                      Activos ({productos.length - inactivos})
                    </option>
                    <option value="inactivos">Desactivados ({inactivos})</option>
                  </select>
                </div>
              </div>

              {cargando ? (
                <div className="card-body stack stack-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-line" />
                  ))}
                </div>
              ) : productosVisibles.length === 0 ? (
                <div className="card-body">
                  <p className="text-muted text-sm">
                    {productos.length === 0
                      ? 'Todavía no hay productos registrados.'
                      : 'No hay productos con ese estado.'}
                  </p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Estado</th>
                        <th className="text-right">Precio</th>
                        <th className="text-right">Stock</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosVisibles.map((p) => {
                        const cat = categorias.find((c) => c.id === p.categoria_id);
                        const inactivo = p.estado_activo === 0;

                        return (
                          <tr key={p.id} className={inactivo ? 'is-inactive' : undefined}>
                            <td>
                              <div className="cell-prod">
                                <img
                                  className="cell-img"
                                  src={p.imagen}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  width="600"
                                  height="400"
                                />
                                <div className="cell-prod-info">
                                  <p className="cell-name">{p.nombre}</p>
                                  <p className="cell-desc">{p.descripcion}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              {cat ? (
                                <span className="badge badge-neutral">{cat.nombre}</span>
                              ) : (
                                <span className="text-subtle text-xs">—</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  inactivo ? 'badge-neutral' : 'badge-success'
                                }`}
                              >
                                {inactivo ? 'Desactivado' : 'Activo'}
                              </span>
                            </td>
                            <td className="text-right tabular">
                              {moneda} {fmt(convertirPrecio(p.precio, moneda))}
                            </td>
                            <td className="text-right">
                              <span
                                className={`badge ${
                                  p.stock > 0 ? 'badge-success' : 'badge-danger'
                                }`}
                              >
                                {p.stock}
                              </span>
                            </td>
                            <td>
                              <div className="row row-2 cell-actions">
                                {inactivo ? (
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => reactivar(p)}
                                    aria-label={`Reactivar ${p.nombre}`}
                                    title="Reactivar"
                                  >
                                    <Icon name="refresh" size={15} />
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => editar(p)}
                                    aria-label={`Editar ${p.nombre}`}
                                  >
                                    <Icon name="pencil" size={15} />
                                  </button>
                                )}
                                <button
                                  className="btn btn-danger-soft btn-sm"
                                  onClick={() => borrar(p)}
                                  aria-label={
                                    inactivo ? `Eliminar ${p.nombre}` : `Desactivar ${p.nombre}`
                                  }
                                  title={inactivo ? 'Eliminar' : 'Desactivar'}
                                >
                                  <Icon name="trash" size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : tab === 'categorias' ? (
          <>
            <section className="card admin-form-card">
              <div className="card-head">
                <h2 className="card-title">Nueva categoría</h2>
              </div>

              <form className="card-body form-grid" onSubmit={crearCategoria}>
                <div className="field form-grid-full">
                  <label className="label" htmlFor="c-nombre">
                    Nombre
                  </label>
                  <input
                    id="c-nombre"
                    className="input"
                    required
                    placeholder="Rosas"
                    value={categoria.nombre}
                    onChange={(e) => setCategoria({ ...categoria, nombre: e.target.value })}
                  />
                </div>

                <div className="field form-grid-full">
                  <button className="btn btn-primary" type="submit" disabled={enviando}>
                    {enviando ? (
                      <>
                        <span className="spinner spinner-inverse" />
                        <span>Guardando…</span>
                      </>
                    ) : (
                      <>
                        <Icon name="plus" size={15} />
                        <span>Crear categoría</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            <section className="card admin-table-card">
              <div className="card-head">
                <h2 className="card-title">Categorías</h2>
                <span className="badge badge-neutral">{categorias.length}</span>
              </div>

              {categorias.length === 0 ? (
                <div className="card-body">
                  <p className="text-muted text-sm">No hay categorías registradas.</p>
                </div>
              ) : (
                <ul className="cat-admin-list">
                  {categorias.map((c) => (
                    <li key={c.id} className="cat-admin-item">
                      <span className="cat-admin-name">{c.nombre}</span>
                      <span
                        className={`badge ${
                          c.estado_activo === 1 ? 'badge-success' : 'badge-neutral'
                        }`}
                      >
                        {c.estado_activo === 1 ? 'Activa' : 'Inactiva'}
                      </span>
                      <button
                        className="btn btn-danger-soft btn-sm"
                        onClick={() => borrarCategoria(c)}
                        aria-label={`Eliminar ${c.nombre}`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : tab === 'pedidos' ? (
          <section className="card admin-table-card">
            <div className="card-head">
              <h2 className="card-title">Pedidos</h2>

              <div className="admin-ped-summary">
                <span className="admin-ped-summary-label">Cobrado</span>

                {ingresosPorMoneda.length === 0 ? (
                  <span className="text-subtle text-xs">Sin datos todavía</span>
                ) : (
                  ingresosPorMoneda.map(([mon, suma]) => (
                    <span key={mon} className="badge badge-brand tabular">
                      {mon} {fmt(suma)}
                    </span>
                  ))
                )}

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={cargarPedidos}
                  disabled={cargandoPedidos}
                  aria-label="Recargar pedidos"
                >
                  <Icon name="refresh" size={15} />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            <div className="card-body admin-ped-filters">
              <div className="field">
                <label className="label" htmlFor="pe-buscar">
                  Buscar
                </label>
                <div className="cat-search admin-user-search">
                  <Icon name="search" size={16} />
                  <input
                    id="pe-buscar"
                    type="search"
                    className="input"
                    placeholder="Nº de pedido, cliente o producto"
                    value={buscaPedido}
                    onChange={(e) => setBuscaPedido(e.target.value)}
                    aria-label="Buscar pedidos"
                  />
                </div>
              </div>
            </div>

            {cargandoPedidos ? (
              <div className="card-body stack stack-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton-line" />
                ))}
              </div>
            ) : pedidosVisibles.length === 0 ? (
              <div className="card-body">
                <p className="text-muted text-sm">
                  {pedidos.length === 0
                    ? 'Todavía no hay pedidos registrados.'
                    : 'Ningún pedido coincide con la búsqueda.'}
                </p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Entrega</th>
                      <th className="text-right">Artículos</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosVisibles.map((p) => {
                      const abierto = pedidoAbierto === p.id;
                      const quien = p.nombre_cliente || p.usuario_nombre || 'Sin nombre';

                      return (
                        <Fragment key={p.id}>
                          <tr>
                            <td>
                              <span className="badge badge-info tabular">#{p.id}</span>
                            </td>
                            <td>
                              <div className="cell-prod-info">
                                <p className="cell-name">{quien}</p>
                                <p className="cell-desc">
                                  {p.usuario_email || 'sin correo'}
                                  {p.cedula ? ` · ${p.cedula}` : ''}
                                </p>
                              </div>
                            </td>
                            <td className="text-sm text-muted nowrap">
                              {fechaCorta(p.fecha)}
                            </td>
                            <td className="text-sm text-muted">{p.pais || '—'}</td>
                            <td className="text-right tabular">{p.articulos}</td>
                            <td className="text-right tabular">
                              {p.moneda} {fmt(p.total)}
                            </td>
                            <td className="text-right">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setPedidoAbierto(abierto ? null : p.id)}
                                aria-expanded={abierto}
                                aria-label={
                                  abierto
                                    ? `Ocultar el detalle del pedido ${p.id}`
                                    : `Ver el detalle del pedido ${p.id}`
                                }
                              >
                                <Icon name={abierto ? 'minus' : 'plus'} size={15} />
                              </button>
                            </td>
                          </tr>

                          {abierto && (
                            <tr className="admin-ped-detail">
                              <td colSpan={7}>
                                <div className="admin-ped-lines">
                                  {p.detalle.map((d, i) => (
                                    <div className="admin-ped-line" key={`${d.producto_id}-${i}`}>
                                      <span className="admin-ped-line-name">{d.nombre}</span>
                                      {/* El precio base del catálogo no sirve aquí:
                                          el pedido se cobró en su propia moneda, así
                                          que el precio unitario se saca del subtotal
                                          ya cobrado. */}
                                      <span className="text-muted text-sm tabular">
                                        {d.cantidad} × {fmt(d.subtotal / d.cantidad)}
                                      </span>
                                      <span className="tabular">
                                        {p.moneda} {fmt(d.subtotal)}
                                      </span>
                                    </div>
                                  ))}

                                  <div className="admin-ped-total">
                                    <span>Total del pedido</span>
                                    <span className="tabular">
                                      {p.moneda} {fmt(p.total)}
                                    </span>
                                  </div>

                                  {p.direccion && (
                                    <p className="admin-ped-note">
                                      Dirección: {p.direccion}
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="card admin-table-card">
            <div className="card-head">
              <h2 className="card-title">Usuarios registrados</h2>
              <span className="badge badge-neutral">
                {usuariosVisibles.length}
                {usuariosVisibles.length !== usuarios.length ? ` de ${usuarios.length}` : ''}
              </span>
            </div>

            <div className="card-body admin-user-filters">
              <div className="field">
                <label className="label" htmlFor="u-buscar">
                  Buscar
                </label>
                <div className="cat-search admin-user-search">
                  <Icon name="search" size={16} />
                  <input
                    id="u-buscar"
                    type="search"
                    className="input"
                    placeholder="Nombre o correo"
                    value={buscaUsuario}
                    onChange={(e) => setBuscaUsuario(e.target.value)}
                    aria-label="Buscar usuarios"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="u-filtro">
                  Filtrar por
                </label>
                <select
                  id="u-filtro"
                  className="select"
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="admins">Solo administradores</option>
                  <option value="clientes">Solo clientes</option>
                  <option value="inactivos">Inactivas</option>
                </select>
              </div>
            </div>

            {usuariosVisibles.length === 0 ? (
              <div className="card-body">
                <p className="text-muted text-sm">
                  {usuarios.length === 0
                    ? 'Todavía no hay usuarios registrados.'
                    : 'Ningún usuario coincide con el filtro aplicado.'}
                </p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Fecha de registro</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosVisibles.map((u) => {
                      const propio = Number(u.id) === Number(user?.id);
                      const ocupado = guardandoUsuario === u.id;

                      return (
                        <tr key={u.id} className={u.estado_activo === 0 ? 'is-inactive' : ''}>
                          <td>
                            <div className="cell-user">
                              <span className="cell-avatar" aria-hidden="true">
                                <Icon name="user" size={16} />
                              </span>
                              <div className="cell-prod-info">
                                <p className="cell-name">
                                  {u.nombre}
                                  {propio && <span className="badge badge-info">Tú</span>}
                                </p>
                                <p className="cell-desc">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                u.rol === 'admin' ? 'badge-brand' : 'badge-neutral'
                              }`}
                            >
                              {u.rol === 'admin' ? 'Administrador' : 'Cliente'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                u.estado_activo === 1 ? 'badge-success' : 'badge-danger'
                              }`}
                            >
                              {u.estado_activo === 1 ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-sm text-muted">
                            {u.created_at
                              ? new Date(u.created_at).toLocaleDateString('es-ES')
                              : '—'}
                          </td>
                          <td>
                            <div className="row row-2 cell-actions">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => alternarRol(u)}
                                disabled={ocupado || propio}
                                title={
                                  propio
                                    ? 'No puedes cambiar tu propio rol'
                                    : u.rol === 'admin'
                                      ? 'Quitar administrador'
                                      : 'Dar administrador'
                                }
                                aria-label={`Cambiar rol de ${u.nombre}`}
                              >
                                <Icon name="shield" size={15} />
                              </button>
                              <button
                                className={`btn btn-sm ${
                                  u.estado_activo === 1 ? 'btn-danger-soft' : 'btn-secondary'
                                }`}
                                onClick={() => alternarEstado(u)}
                                disabled={ocupado || propio}
                                title={
                                  propio
                                    ? 'No puedes desactivar tu propia cuenta'
                                    : u.estado_activo === 1
                                      ? 'Desactivar cuenta'
                                      : 'Reactivar cuenta'
                                }
                                aria-label={`${
                                  u.estado_activo === 1 ? 'Desactivar' : 'Reactivar'
                                } ${u.nombre}`}
                              >
                                <Icon name={u.estado_activo === 1 ? 'trash' : 'refresh'} size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
