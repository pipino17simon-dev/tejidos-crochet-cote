/*
  =====================================================================
  TEJIDOS A CROCHET COTE — script.js
  =====================================================================
  1. Configuración de Supabase
  2. Variables globales
  3. Inicialización al cargar la página
  4. Autenticación (login, registro, logout)
  5. Productos (cargar, renderizar, filtrar)
  6. Panel de Administración
  7. Interfaz de usuario (modales, navbar, toast)
  8. Funciones auxiliares
  =====================================================================
*/


/* =====================================================================
   1. CONFIGURACIÓN DE SUPABASE — credenciales del proyecto
   ===================================================================== */
const SUPABASE_URL      = 'https://pcxihgvbykkzvylbqlmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGloZ3ZieWtrenZ5bGJxbG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTczMTMsImV4cCI6MjA5NTA3MzMxM30.70NbbAdcnyZvUETodRelptwTZy6jNRjl4GSvJlFvHJA';

/* Inicializa el cliente de Supabase */
if (!window.supabase) {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#btnAbrirLogin, #btnAbrirRegistro').forEach(btn => {
      btn.disabled = true;
      btn.title = 'Error de conexión. Recarga la página.';
    });
    const estado = document.getElementById('mensajeEstado');
    const texto  = document.getElementById('textoEstado');
    const spinner = document.getElementById('spinnerProductos');
    if (estado && texto) {
      if (spinner) spinner.classList.add('hidden');
      texto.textContent = 'Error de conexión. Recarga la página e intenta de nuevo.';
      estado.classList.remove('hidden');
    }
  });
  throw new Error('Supabase SDK no disponible.');
}
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Usuario de Instagram de la tienda */
const INSTAGRAM_USUARIO = 'tejidoscrochet_cote';


/* =====================================================================
   2. VARIABLES GLOBALES
   ===================================================================== */
let todosLosProductos = [];   // Todos los productos cargados
let categoriaActiva   = 'todos'; // Filtro activo
let usuarioActual     = null; // Usuario con sesión
let esAdmin           = false; // Si es administrador

/* Productos estáticos con imágenes locales (se muestran si Supabase está vacío) */
const PRODUCTOS_ESTATICOS = [
  { id:'s01', nombre:'Cardigan tejido a crochet',         categoria:'Ropa tejida',           estado:'disponible',   descripcion:'Cardigan artesanal tejido a crochet, ideal para el día a día.', imagen_url:'imagenes/producto-01.jpeg' },
  { id:'s02', nombre:'Blusa crochet manga larga',         categoria:'Ropa tejida',           estado:'disponible',   descripcion:'Blusa tejida a mano con detalle calado, muy cómoda y versátil.', imagen_url:'imagenes/producto-02.jpeg' },
  { id:'s03', nombre:'Vestido tejido a crochet',          categoria:'Ropa tejida',           estado:'disponible',   descripcion:'Vestido artesanal tejido a crochet, hecho con hilos de calidad.', imagen_url:'imagenes/producto-03.jpeg' },
  { id:'s04', nombre:'Top crochet colores',               categoria:'Ropa tejida',           estado:'disponible',   descripcion:'Top tejido a crochet, fresco y original.', imagen_url:'imagenes/producto-04.jpeg' },
  { id:'s05', nombre:'Abrigo tejido artesanal',           categoria:'Ropa tejida',           estado:'a_pedido',     descripcion:'Abrigo tejido a mano, cálido y elegante.', imagen_url:'imagenes/producto-05.jpeg' },
  { id:'s06', nombre:'Conjunto crochet primavera',        categoria:'Ropa tejida',           estado:'disponible',   descripcion:'Conjunto de dos piezas tejido a crochet.', imagen_url:'imagenes/producto-06.jpeg' },
  { id:'s07', nombre:'Chaleco tejido crochet',            categoria:'Ropa tejida',           estado:'disponible',   descripcion:'Chaleco sin mangas tejido a crochet, muy liviano.', imagen_url:'imagenes/producto-07.jpeg' },
  { id:'s08', nombre:'Falda crochet verano',              categoria:'Ropa tejida',           estado:'a_pedido',     descripcion:'Falda tejida a crochet, perfecta para el verano.', imagen_url:'imagenes/producto-08.jpeg' },
  { id:'s09', nombre:'Conjunto bebé tejido',              categoria:'Ropa de bebé',          estado:'disponible',   descripcion:'Hermoso conjunto tejido para bebé, suave y delicado.', imagen_url:'imagenes/producto-09.jpeg' },
  { id:'s10', nombre:'Ajuar bebé recién nacido',          categoria:'Ropa de bebé',          estado:'disponible',   descripcion:'Ajuar completo tejido a crochet para recién nacido.', imagen_url:'imagenes/producto-10.jpeg' },
  { id:'s11', nombre:'Gorrito bebé crochet',              categoria:'Ropa de bebé',          estado:'disponible',   descripcion:'Gorrito tejido a crochet para bebé, suave y abrigado.', imagen_url:'imagenes/producto-11.jpeg' },
  { id:'s12', nombre:'Zapatitos tejidos bebé',            categoria:'Ropa de bebé',          estado:'disponible',   descripcion:'Zapatitos tejidos a mano para bebé.', imagen_url:'imagenes/producto-12.jpeg' },
  { id:'s13', nombre:'Mameluco bebé tejido',              categoria:'Ropa de bebé',          estado:'a_pedido',     descripcion:'Mameluco artesanal tejido a crochet para bebé.', imagen_url:'imagenes/producto-13.jpeg' },
  { id:'s14', nombre:'Set canastilla bebé',               categoria:'Ropa de bebé',          estado:'personalizable','descripcion':'Set de canastilla tejido a pedido en los colores que elijas.', imagen_url:'imagenes/producto-14.jpeg' },
  { id:'s15', nombre:'Chaquetita bebé crochet',           categoria:'Ropa de bebé',          estado:'disponible',   descripcion:'Chaquetita tejida para bebé, suave y amorosa.', imagen_url:'imagenes/producto-15.jpeg' },
  { id:'s16', nombre:'Gorro pompón adulto',               categoria:'Accesorios',            estado:'disponible',   descripcion:'Gorrito tejido a crochet con pompón, abrigado y lindo.', imagen_url:'imagenes/producto-16.jpeg' },
  { id:'s17', nombre:'Bolso tejido crochet',              categoria:'Accesorios',            estado:'disponible',   descripcion:'Bolso artesanal tejido a crochet, original y resistente.', imagen_url:'imagenes/producto-17.jpeg' },
  { id:'s18', nombre:'Vincha tejida crochet',             categoria:'Accesorios',            estado:'disponible',   descripcion:'Vincha tejida a mano, cómoda y estilosa.', imagen_url:'imagenes/producto-18.jpeg' },
  { id:'s19', nombre:'Cuello tejido lana',                categoria:'Accesorios',            estado:'disponible',   descripcion:'Cuello / bufanda tejida a crochet, perfecta para el invierno.', imagen_url:'imagenes/producto-19.jpeg' },
  { id:'s20', nombre:'Cartera tejida crochet',            categoria:'Accesorios',            estado:'disponible',   descripcion:'Cartera pequeña tejida a crochet.', imagen_url:'imagenes/producto-20.jpeg' },
  { id:'s21', nombre:'Guantes tejidos a mano',            categoria:'Accesorios',            estado:'a_pedido',     descripcion:'Guantes tejidos a crochet, cálidos y delicados.', imagen_url:'imagenes/producto-21.jpeg' },
  { id:'s22', nombre:'Pulseras tejidas crochet',          categoria:'Accesorios',            estado:'disponible',   descripcion:'Pulseras tejidas a mano, perfectas para regalar.', imagen_url:'imagenes/producto-22.jpeg' },
  { id:'s23', nombre:'Amigurumi osito',                   categoria:'Amigurumis',            estado:'disponible',   descripcion:'Amigurumi osito tejido a crochet, ideal para regalar.', imagen_url:'imagenes/producto-23.jpeg' },
  { id:'s24', nombre:'Amigurumi conejita',                categoria:'Amigurumis',            estado:'disponible',   descripcion:'Amigurumi conejita adorable tejida a crochet.', imagen_url:'imagenes/producto-24.jpeg' },
  { id:'s25', nombre:'Amigurumi pollito bebé',            categoria:'Amigurumis',            estado:'disponible',   descripcion:'Pollito amigurumi tejido a crochet, muy tierno.', imagen_url:'imagenes/producto-25.jpeg' },
  { id:'s26', nombre:'Amigurumi personaje',               categoria:'Amigurumis',            estado:'disponible',   descripcion:'Amigurumi artesanal tejido a crochet.', imagen_url:'imagenes/producto-26.jpeg' },
  { id:'s27', nombre:'Amigurumi dinosaurio',              categoria:'Amigurumis',            estado:'disponible',   descripcion:'Dinosaurio amigurumi tejido a crochet.', imagen_url:'imagenes/producto-27.jpeg' },
  { id:'s28', nombre:'Amigurumi gato',                    categoria:'Amigurumis',            estado:'a_pedido',     descripcion:'Gatito amigurumi tejido a crochet.', imagen_url:'imagenes/producto-28.jpeg' },
  { id:'s29', nombre:'Amigurumi personalizado',           categoria:'Amigurumis',            estado:'personalizable','descripcion':'Amigurumi hecho a tu pedido: elige el personaje, colores y tamaño.', imagen_url:'imagenes/producto-29.jpeg' },
  { id:'s30', nombre:'Amigurumi frutas',                  categoria:'Amigurumis',            estado:'disponible',   descripcion:'Set de frutas amigurumi tejidas a crochet.', imagen_url:'imagenes/producto-30.jpeg' },
  { id:'s31', nombre:'Pedido personalizado cardigan',     categoria:'Pedidos personalizados', estado:'personalizable','descripcion':'Cardigan tejido a tu medida y en los colores que quieras.', imagen_url:'imagenes/producto-31.jpeg' },
  { id:'s32', nombre:'Conjunto personalizado bebé',       categoria:'Pedidos personalizados', estado:'personalizable','descripcion':'Conjunto de bebé tejido a pedido según tus preferencias.', imagen_url:'imagenes/producto-32.jpeg' },
  { id:'s33', nombre:'Bolso personalizado crochet',       categoria:'Pedidos personalizados', estado:'personalizable','descripcion':'Bolso tejido a pedido: elige tamaño, color y diseño.', imagen_url:'imagenes/producto-33.jpeg' },
  { id:'s34', nombre:'Peluche personalizado',             categoria:'Pedidos personalizados', estado:'personalizable','descripcion':'Peluche o amigurumi hecho a tu elección.', imagen_url:'imagenes/producto-34.jpeg' },
  { id:'s35', nombre:'Tejido personalizado regalo',       categoria:'Pedidos personalizados', estado:'personalizable','descripcion':'¿Necesitas un regalo especial? Encarga tu tejido personalizado.', imagen_url:'imagenes/producto-35.jpeg' },
  { id:'s36', nombre:'Blusa tejida especial',             categoria:'Ropa tejida',           estado:'vendido',      descripcion:'Blusa tejida a crochet con diseño especial.', imagen_url:'imagenes/producto-36.jpeg' },
  { id:'s37', nombre:'Conjunto tejido colorido',          categoria:'Ropa tejida',           estado:'disponible',   descripcion:'Conjunto tejido a crochet en colores vibrantes.', imagen_url:'imagenes/producto-37.jpeg' },
  { id:'s38', nombre:'Set accesorios tejidos',            categoria:'Accesorios',            estado:'disponible',   descripcion:'Set de accesorios tejidos a crochet.', imagen_url:'imagenes/producto-38.jpeg' },
  { id:'s39', nombre:'Ropa bebé especial',                categoria:'Ropa de bebé',          estado:'a_pedido',     descripcion:'Ropa de bebé tejida a mano con detalles especiales.', imagen_url:'imagenes/producto-39.jpeg' },
  { id:'s40', nombre:'Amigurumi colección',               categoria:'Amigurumis',            estado:'disponible',   descripcion:'Amigurumi de colección, tejido con mucho detalle.', imagen_url:'imagenes/producto-40.jpeg' },
  { id:'s41', nombre:'Creación especial crochet',         categoria:'Ropa tejida',           estado:'disponible',   descripcion:'Creación artesanal tejida a crochet con amor.', imagen_url:'imagenes/producto-41.jpeg' },
];


/* =====================================================================
   3. INICIALIZACIÓN AL CARGAR LA PÁGINA
   ===================================================================== */
document.addEventListener('DOMContentLoaded', async () => {

  /* Escuchar cambios de sesión (login / logout) */
  sbClient.auth.onAuthStateChange(async (evento, sesion) => {
    if (sesion) {
      usuarioActual = sesion.user;
      await verificarRolAdmin(usuarioActual.id);
      actualizarInterfazSesion(true);
    } else {
      usuarioActual = null;
      esAdmin = false;
      actualizarInterfazSesion(false);
    }
  });

  /* Verificar si ya hay sesión activa (con timeout por si Supabase está bloqueado) */
  try {
    const { data: { session } } = await Promise.race([
      sbClient.auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
    ]);
    if (session) {
      usuarioActual = session.user;
      await verificarRolAdmin(usuarioActual.id);
      actualizarInterfazSesion(true);
    }
  } catch {
    /* sin sesión o Supabase bloqueado — continuar sin sesión */
  }

  /* Cargar productos en la galería */
  await cargarProductos();

  /* Sombra en navbar al hacer scroll */
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')
      .classList.toggle('scrolled', window.scrollY > 10);
  });

  /* Cerrar modal al hacer clic en el overlay */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  });

  /* Cerrar menú móvil al hacer clic en un link */
  document.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => cerrarMenuMovil());
  });
});


/* =====================================================================
   4. AUTENTICACIÓN
   ===================================================================== */

/* Registra un nuevo usuario */
async function registrarUsuario(evento) {
  evento.preventDefault();

  const nombre   = document.getElementById('registroNombre').value.trim();
  const email    = document.getElementById('registroEmail').value.trim();
  const password = document.getElementById('registroPassword').value;
  const confirm  = document.getElementById('registroPasswordConfirm').value;

  limpiarErrores(['errorRegistroNombre','errorRegistroEmail',
                  'errorRegistroPassword','errorRegistroConfirm']);

  let hayError = false;
  if (!nombre)              { mostrarError('errorRegistroNombre',    'El nombre es obligatorio.');          hayError = true; }
  if (!validarEmail(email)) { mostrarError('errorRegistroEmail',     'Ingresa un correo válido.');          hayError = true; }
  if (password.length < 8)  { mostrarError('errorRegistroPassword',  'Mínimo 8 caracteres.');              hayError = true; }
  if (password !== confirm)  { mostrarError('errorRegistroConfirm',  'Las contraseñas no coinciden.');     hayError = true; }
  if (hayError) return;

  mostrarMensajeForm('mensajeRegistro', 'Creando tu cuenta...', 'cargando');
  deshabilitarBoton('btnRegistro', true);

  try {
    const { data, error } = await sbClient.auth.signUp({
      email, password,
      options: {
        data: { nombre },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;

    if (data.user) {
      await sbClient.from('perfiles').insert({
        id: data.user.id, nombre, email, rol: 'usuario'
      });
    }

    mostrarMensajeForm('mensajeRegistro',
      '✅ Cuenta creada. Revisa tu correo para confirmar.', 'exito');
    document.getElementById('formRegistro').reset();

  } catch (error) {
    mostrarMensajeForm('mensajeRegistro', `❌ ${traducirErrorAuth(error.message)}`, 'error');
  } finally {
    deshabilitarBoton('btnRegistro', false);
  }
}

/* Inicia sesión con email y contraseña */
async function iniciarSesion(evento) {
  evento.preventDefault();

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  limpiarErrores(['errorLoginEmail','errorLoginPassword']);

  let hayError = false;
  if (!validarEmail(email)) { mostrarError('errorLoginEmail',    'Correo inválido.'); hayError = true; }
  if (!password)             { mostrarError('errorLoginPassword', 'Ingresa tu contraseña.'); hayError = true; }
  if (hayError) return;

  mostrarMensajeForm('mensajeLogin', 'Iniciando sesión...', 'cargando');
  deshabilitarBoton('btnLogin', true);

  try {
    const { error } = await sbClient.auth.signInWithPassword({ email, password });
    if (error) throw error;

    cerrarModal('modalLogin');
    document.getElementById('formLogin').reset();
    mostrarToast('¡Bienvenida! 🧶', 'exito');

  } catch (error) {
    mostrarMensajeForm('mensajeLogin', `❌ ${traducirErrorAuth(error.message)}`, 'error');
  } finally {
    deshabilitarBoton('btnLogin', false);
  }
}

/* Cierra la sesión */
async function cerrarSesion() {
  await sbClient.auth.signOut();
  mostrarToast('Sesión cerrada. ¡Hasta pronto! 👋', 'info');
}

/* Verifica si el usuario tiene rol admin */
async function verificarRolAdmin(userId) {
  try {
    const { data, error } = await sbClient
      .from('perfiles').select('rol').eq('id', userId).single();
    if (error) throw error;
    esAdmin = (data?.rol === 'admin');
  } catch {
    esAdmin = false;
  }
}

/* Actualiza la interfaz según el estado de sesión */
async function actualizarInterfazSesion(haySesion) {
  const btnLogin    = document.getElementById('btnAbrirLogin');
  const btnRegistro = document.getElementById('btnAbrirRegistro');
  const areaUsuario = document.getElementById('areaUsuario');
  const badgeAdmin  = document.getElementById('badgeAdmin');
  const panelAdmin  = document.getElementById('panelAdmin');

  if (haySesion && usuarioActual) {
    btnLogin.classList.add('hidden');
    btnRegistro.classList.add('hidden');
    areaUsuario.classList.remove('hidden');
    document.getElementById('usuarioEmail').textContent = usuarioActual.email;

    if (esAdmin) {
      badgeAdmin.classList.remove('hidden');
      panelAdmin.classList.remove('hidden');
      await cargarProductosAdmin();
    } else {
      badgeAdmin.classList.add('hidden');
      panelAdmin.classList.add('hidden');
    }
  } else {
    btnLogin.classList.remove('hidden');
    btnRegistro.classList.remove('hidden');
    areaUsuario.classList.add('hidden');
    badgeAdmin.classList.add('hidden');
    panelAdmin.classList.add('hidden');
  }
}


/* =====================================================================
   5. PRODUCTOS — cargar, renderizar y filtrar
   ===================================================================== */

/* Carga todos los productos activos desde Supabase */
async function cargarProductos() {
  const spinnerEl  = document.getElementById('spinnerProductos');
  const textoEl    = document.getElementById('textoEstado');
  const mensajeEl  = document.getElementById('mensajeEstado');
  const gridEl     = document.getElementById('productosGrid');

  mensajeEl.classList.remove('hidden');
  spinnerEl.classList.remove('hidden');
  textoEl.textContent = 'Cargando productos...';
  gridEl.innerHTML = '';

  try {
    const { data: productos, error } = await Promise.race([
      sbClient.from('productos').select('*').eq('activo', true).order('created_at', { ascending: false }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);

    if (error) throw error;

    todosLosProductos = (productos && productos.length > 0)
      ? productos
      : PRODUCTOS_ESTATICOS;

    mensajeEl.classList.add('hidden');
    renderizarProductos(todosLosProductos);

  } catch (error) {
    console.warn('Supabase no disponible, usando productos locales:', error.message);
    todosLosProductos = PRODUCTOS_ESTATICOS;
    mensajeEl.classList.add('hidden');
    renderizarProductos(todosLosProductos);
  }
}

/* Filtra los productos por categoría */
function filtrarProductos(categoria) {
  categoriaActiva = categoria;

  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.categoria === categoria);
  });

  const filtrados = categoria === 'todos'
    ? todosLosProductos
    : todosLosProductos.filter(p => p.categoria === categoria);

  const mensajeEl = document.getElementById('mensajeEstado');
  const textoEl   = document.getElementById('textoEstado');
  const spinnerEl = document.getElementById('spinnerProductos');

  if (filtrados.length === 0) {
    mensajeEl.classList.remove('hidden');
    spinnerEl.classList.add('hidden');
    textoEl.textContent = `No hay productos en "${categoria}" aún.`;
    document.getElementById('productosGrid').innerHTML = '';
  } else {
    mensajeEl.classList.add('hidden');
    renderizarProductos(filtrados);
  }
}

/* Genera las tarjetas de productos en el grid */
function renderizarProductos(productos) {
  const gridEl = document.getElementById('productosGrid');
  gridEl.innerHTML = '';
  productos.forEach((producto, i) => gridEl.appendChild(crearTarjetaProducto(producto, i)));
}

/* Crea el HTML de una tarjeta de producto */
function crearTarjetaProducto(producto, indice) {
  const card = document.createElement('div');
  card.className = 'producto-card';
  card.setAttribute('role', 'listitem');
  card.style.animationDelay = `${indice * 0.07}s`;

  const estadoTextos = {
    disponible:     '✅ Disponible',
    vendido:        '❌ Vendido',
    a_pedido:       '📦 A pedido',
    personalizable: '✨ Personalizable'
  };

  let textoBoton, mensajeIG;
  switch (producto.estado) {
    case 'disponible':
      textoBoton = '🛍️ Pedir por Instagram';
      mensajeIG  = `Hola! Quisiera consultar por "${producto.nombre}" 🧶`;
      break;
    case 'a_pedido':
      textoBoton = '📦 Consultar disponibilidad';
      mensajeIG  = `Hola! Me interesa hacer un pedido de "${producto.nombre}" 🧶`;
      break;
    case 'personalizable':
      textoBoton = '✨ Hacer pedido personalizado';
      mensajeIG  = `Hola! Me gustaría un pedido personalizado de "${producto.nombre}" 🧶`;
      break;
    case 'vendido':
      textoBoton = '💬 Consultar por uno similar';
      mensajeIG  = `Hola! Vi que "${producto.nombre}" está vendido, ¿puedes hacer uno similar? 🧶`;
      break;
    default:
      textoBoton = '📩 Consultar por Instagram';
      mensajeIG  = `Hola! Quiero consultar por "${producto.nombre}" 🧶`;
  }

  const urlIG = `https://www.instagram.com/direct/new/?to=${INSTAGRAM_USUARIO}&text=${encodeURIComponent(mensajeIG)}`;

  const nombreSeguro      = escaparHTML(producto.nombre);
  const descripcionSegura = escaparHTML(producto.descripcion);
  const srcSeguro         = escaparHTML(producto.imagen_url);

  const imagenHtml = producto.imagen_url
    ? `<img src="${srcSeguro}"
            alt="${nombreSeguro} — tejido a crochet hecho a mano"
            class="producto-card__imagen"
            loading="lazy"
            onerror="this.onerror=null;this.parentElement.innerHTML='<div class=&quot;producto-card__sin-imagen&quot;><span>🧶</span></div>'" />`
    : `<div class="producto-card__sin-imagen"><span>🧶</span></div>`;

  card.innerHTML = `
    <div class="producto-card__imagen-wrap">
      ${imagenHtml}
    </div>
    <div class="producto-card__cuerpo">
      <h3 class="producto-card__nombre">${nombreSeguro}</h3>
      ${producto.descripcion ? `<p class="producto-card__descripcion">${descripcionSegura}</p>` : ''}
      <div class="producto-card__boton">
        <a href="${urlIG}" target="_blank" rel="noopener noreferrer"
           class="btn btn--instagram btn--full btn--sm">
          ${textoBoton}
        </a>
      </div>
    </div>`;

  return card;
}


/* =====================================================================
   6. PANEL DE ADMINISTRACIÓN
   ===================================================================== */

/* Carga la lista de todos los productos en el panel admin */
async function cargarProductosAdmin() {
  const listaEl = document.getElementById('adminProductosLista');
  if (!listaEl) return;
  listaEl.innerHTML = '<p style="color:#999">Cargando...</p>';

  try {
    const { data: productos, error } = await sbClient
      .from('productos').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    if (!productos?.length) {
      listaEl.innerHTML = '<p style="color:#999">No hay productos aún. ¡Agrega el primero!</p>';
      return;
    }

    listaEl.innerHTML = '';
    productos.forEach(producto => {
      const item = document.createElement('div');
      item.className = 'admin-item';
      item.id = `admin-item-${producto.id}`;
      const nAdmin = escaparHTML(producto.nombre);
      const cAdmin = escaparHTML(producto.categoria);
      const eAdmin = escaparHTML(producto.estado);
      const sAdmin = escaparHTML(producto.imagen_url || '');
      item.innerHTML = `
        <img src="${sAdmin}" alt="${nAdmin}"
             class="admin-item__img" onerror="this.src=''" />
        <div class="admin-item__info">
          <p class="admin-item__nombre">${nAdmin}</p>
          <p class="admin-item__categoria">
            ${cAdmin} · ${eAdmin}
            ${producto.activo ? '' : ' · <em>Inactivo</em>'}
          </p>
        </div>
        <div class="admin-item__acciones">
          <button class="btn btn--outline btn--sm"
                  onclick="editarProducto('${escaparHTML(producto.id)}')">✏️ Editar</button>
          <button class="btn btn--sm" style="background:#ffebee;color:#c62828;border:2px solid #ef9a9a"
                  onclick="eliminarProducto('${escaparHTML(producto.id)}','${nAdmin}')">
            🗑️ Eliminar
          </button>
        </div>`;
      listaEl.appendChild(item);
    });

  } catch (error) {
    listaEl.innerHTML = '<p style="color:red">Error al cargar productos.</p>';
  }
}

/* Filtra la lista admin por nombre */
function filtrarAdminProductos() {
  const busqueda = document.getElementById('adminBuscar').value.toLowerCase();
  document.querySelectorAll('.admin-item').forEach(item => {
    const nombre = item.querySelector('.admin-item__nombre').textContent.toLowerCase();
    item.style.display = nombre.includes(busqueda) ? '' : 'none';
  });
}

/* Guarda un producto nuevo o actualiza uno existente */
async function guardarProducto(evento) {
  evento.preventDefault();
  if (!esAdmin) { mostrarToast('❌ No tienes permisos de administrador.', 'error'); return; }

  const id          = document.getElementById('adminProductoId').value;
  const nombre      = document.getElementById('adminNombre').value.trim();
  const categoria   = document.getElementById('adminCategoria').value;
  const estado      = document.getElementById('adminEstado').value;
  const descripcion = document.getElementById('adminDescripcion').value.trim();
  const activo      = document.getElementById('adminActivo').checked;
  const imagenUrl   = document.getElementById('adminImagenUrl').value.trim();
  const imagenArchivo = document.getElementById('adminImagenArchivo').files[0];

  limpiarErrores(['errorAdminNombre','errorAdminCategoria','errorAdminEstado']);
  let hayError = false;
  if (!nombre)    { mostrarError('errorAdminNombre',    'El nombre es obligatorio.'); hayError = true; }
  if (!categoria) { mostrarError('errorAdminCategoria', 'Selecciona una categoría.'); hayError = true; }
  if (!estado)    { mostrarError('errorAdminEstado',    'Selecciona un estado.');     hayError = true; }
  if (hayError) return;

  mostrarMensajeForm('mensajeAdmin', 'Guardando producto...', 'cargando');
  deshabilitarBoton('btnGuardarProducto', true);

  try {
    let urlFinalImagen = imagenUrl;

    /* Si hay archivo, subirlo a Supabase Storage */
    if (imagenArchivo) {
      const ext       = imagenArchivo.name.split('.').pop();
      const nombreArch = `${Date.now()}-${Math.random().toString(36).substr(2,9)}.${ext}`;
      const ruta       = `productos/${nombreArch}`;

      const { error: errorSubida } = await sbClient.storage
        .from('imagenes').upload(ruta, imagenArchivo, { upsert: false });
      if (errorSubida) throw errorSubida;

      const { data: urlData } = sbClient.storage.from('imagenes').getPublicUrl(ruta);
      urlFinalImagen = urlData.publicUrl;
    }

    const datos = {
      nombre, categoria, estado,
      descripcion: descripcion || null,
      activo,
      ...(urlFinalImagen && { imagen_url: urlFinalImagen })
    };

    const resultado = id
      ? await sbClient.from('productos').update(datos).eq('id', id)
      : await sbClient.from('productos').insert(datos);

    if (resultado.error) throw resultado.error;

    const msg = id ? '✅ Producto actualizado.' : '✅ Producto agregado.';
    mostrarMensajeForm('mensajeAdmin', msg, 'exito');
    mostrarToast(msg, 'exito');
    limpiarFormAdmin();
    await cargarProductos();
    await cargarProductosAdmin();
    cambiarTabAdmin('tabProductos');

  } catch (error) {
    mostrarMensajeForm('mensajeAdmin', `❌ Error: ${error.message}`, 'error');
  } finally {
    deshabilitarBoton('btnGuardarProducto', false);
  }
}

/* Carga los datos de un producto en el formulario para editarlo */
async function editarProducto(productoId) {
  try {
    const { data: p, error } = await sbClient
      .from('productos').select('*').eq('id', productoId).single();
    if (error) throw error;

    document.getElementById('adminProductoId').value  = p.id;
    document.getElementById('adminNombre').value       = p.nombre;
    document.getElementById('adminCategoria').value    = p.categoria;
    document.getElementById('adminEstado').value       = p.estado;
    document.getElementById('adminDescripcion').value  = p.descripcion || '';
    document.getElementById('adminActivo').checked     = p.activo;
    document.getElementById('adminImagenUrl').value    = p.imagen_url || '';

    if (p.imagen_url) {
      const preview = document.getElementById('previewImagen');
      preview.src = p.imagen_url;
      preview.classList.remove('hidden');
    }

    document.getElementById('btnGuardarProducto').textContent = 'Actualizar producto';
    cambiarTabAdmin('tabAgregar');
    document.getElementById('tabAgregar').scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    mostrarToast('❌ Error al cargar el producto.', 'error');
  }
}

/* Elimina un producto tras confirmación */
async function eliminarProducto(productoId, productoNombre) {
  if (!confirm(`¿Eliminar "${productoNombre}"?\nEsta acción no se puede deshacer.`)) return;

  try {
    const { error } = await sbClient.from('productos').delete().eq('id', productoId);
    if (error) throw error;
    mostrarToast('✅ Producto eliminado.', 'exito');
    await cargarProductos();
    await cargarProductosAdmin();
  } catch (error) {
    mostrarToast('❌ Error al eliminar.', 'error');
  }
}

/* Limpia el formulario admin */
function limpiarFormAdmin() {
  document.getElementById('formAgregarProducto').reset();
  document.getElementById('adminProductoId').value = '';
  document.getElementById('btnGuardarProducto').textContent = 'Guardar producto';
  const preview = document.getElementById('previewImagen');
  preview.src = '';
  preview.classList.add('hidden');
  const msg = document.getElementById('mensajeAdmin');
  msg.classList.add('hidden');
  msg.textContent = '';
  limpiarErrores(['errorAdminNombre','errorAdminCategoria','errorAdminEstado']);
}

/* Previsualiza la imagen seleccionada */
function previsualizarImagen(evento) {
  const archivo   = evento.target.files[0];
  const previewEl = document.getElementById('previewImagen');
  if (!archivo) { previewEl.classList.add('hidden'); return; }

  if (archivo.size > 5 * 1024 * 1024) {
    mostrarToast('❌ La imagen no puede superar 5 MB.', 'error');
    evento.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = e => { previewEl.src = e.target.result; previewEl.classList.remove('hidden'); };
  reader.readAsDataURL(archivo);
}

/* Cambia entre pestañas del panel admin */
function cambiarTabAdmin(tabId) {
  document.querySelectorAll('.admin-contenido').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('activo'));
  document.getElementById(tabId).classList.remove('hidden');
  const btnId = tabId === 'tabProductos' ? 'btnTabProductos' : 'btnTabAgregar';
  document.getElementById(btnId).classList.add('activo');
}


/* =====================================================================
   7. INTERFAZ DE USUARIO
   ===================================================================== */

function mostrarModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  document.body.style.overflow = '';
}

function cambiarModal(cerrar, abrir) {
  cerrarModal(cerrar);
  mostrarModal(abrir);
}

function toggleMenu() {
  document.getElementById('navMenu').classList.toggle('abierto');
  document.querySelector('.navbar__auth').classList.toggle('abierto');
}

function cerrarMenuMovil() {
  document.getElementById('navMenu').classList.remove('abierto');
  document.querySelector('.navbar__auth').classList.remove('abierto');
}

function mostrarToast(texto, tipo = 'info', duracion = 3500) {
  const toast   = document.getElementById('toast');
  const textoEl = document.getElementById('toastTexto');
  textoEl.textContent = texto;
  toast.className = `toast ${tipo}`;
  toast.classList.remove('hidden');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.add('hidden'), duracion);
}


/* =====================================================================
   8. FUNCIONES AUXILIARES
   ===================================================================== */

function escaparHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarError(idElemento, mensaje) {
  const el = document.getElementById(idElemento);
  if (el) el.textContent = mensaje;
}

function limpiarErrores(ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
}

function mostrarMensajeForm(idElemento, texto, tipo) {
  const el = document.getElementById(idElemento);
  if (!el) return;
  el.textContent = texto;
  el.className   = `form-mensaje ${tipo}`;
  el.classList.remove('hidden');
}

function deshabilitarBoton(idBoton, deshabilitar) {
  const btn = document.getElementById(idBoton);
  if (!btn) return;
  btn.disabled      = deshabilitar;
  btn.style.opacity = deshabilitar ? '0.6' : '1';
}

function traducirErrorAuth(msg) {
  const t = {
    'Invalid login credentials':  'Correo o contraseña incorrectos.',
    'Email not confirmed':         'Confirma tu correo antes de iniciar sesión.',
    'User already registered':     'Ya existe una cuenta con ese correo.',
    'Password should be at least': 'La contraseña debe tener al menos 6 caracteres.',
    'Email rate limit exceeded':   'Demasiados intentos. Espera unos minutos.',
  };
  for (const [k, v] of Object.entries(t)) { if (msg.includes(k)) return v; }
  return msg || 'Ocurrió un error. Intenta de nuevo.';
}
