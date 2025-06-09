const ADMIN_PASS = "admin123";
const MONEDA = "S/";

function obtenerProductos() {
  let guardados = localStorage.getItem("vistete_productos");
  if (guardados) {
    try { return JSON.parse(guardados); }
    catch { localStorage.removeItem("vistete_productos"); }
  }
  const ejemplo = [
    {
      id: crypto.randomUUID(),
      nombre: "Camiseta Pixel",
      descripcion: "Camiseta de algodón, estilo pixel art.",
      precio: 20,
      imagen: "https://i.ibb.co/8rQjzHD/camiseta-pixel.png",
      categoria: "Ropa"
    }
  ];
  localStorage.setItem("vistete_productos", JSON.stringify(ejemplo));
  return ejemplo;
}
function guardarProductos(productos) {
  localStorage.setItem("vistete_productos", JSON.stringify(productos));
}

function obtenerFavoritos() {
  return JSON.parse(localStorage.getItem("vistete_favoritos")) || [];
}
function guardarFavoritos(favs) {
  localStorage.setItem("vistete_favoritos", JSON.stringify(favs));
}

function mostrarProductos() {
  const productos = obtenerProductos();
  const favoritos = obtenerFavoritos();
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';
  productos.forEach(producto => {
    if (!producto.id) return;
    const esFavorito = favoritos.includes(producto.id);
    const div = document.createElement('div');
    div.className = 'producto';
    div.setAttribute('data-id', producto.id);
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="categoria">${producto.categoria}</div>
      <div class="titulo-fav">
        <h3>${producto.nombre}</h3>
        <span class="estrella-fav${esFavorito ? ' favorito' : ''}" title="${esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}" data-id="${producto.id}">${esFavorito ? '★' : '☆'}</span>
      </div>
      <p>${producto.descripcion}</p>
      <div class="precio">${MONEDA} ${producto.precio}</div>
    `;
    contenedor.appendChild(div);
  });

  document.querySelectorAll('.producto').forEach(div => {
    div.addEventListener('click', function(e) {
      if(e.target.classList.contains('estrella-fav')) return;
      const id = this.getAttribute('data-id');
      mostrarModalProducto(id);
    });
  });

  document.querySelectorAll('.estrella-fav').forEach(star => {
    star.onclick = function(e) {
      e.stopPropagation();
      toggleFavorito(this.getAttribute('data-id'));
    };
  });

  actualizarContadorFavoritos();
}

function toggleFavorito(id) {
  let favoritos = obtenerFavoritos();
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(x => x !== id);
  } else {
    favoritos.push(id);
  }
  guardarFavoritos(favoritos);
  mostrarProductos();
  mostrarFavoritos();
  actualizarContadorFavoritos();
}

function mostrarFavoritos() {
  const productos = obtenerProductos();
  const favoritos = obtenerFavoritos();
  const contenedor = document.getElementById('favoritos-lista');
  const vacio = document.getElementById('sin-favoritos');
  contenedor.innerHTML = '';
  const favoritosProductos = productos.filter(p => favoritos.includes(p.id));
  if(favoritosProductos.length === 0) {
    vacio.style.display = "block";
    return;
  }
  vacio.style.display = "none";
  favoritosProductos.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.setAttribute('data-id', producto.id);
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="categoria">${producto.categoria}</div>
      <div class="titulo-fav">
        <h3>${producto.nombre}</h3>
        <span class="estrella-fav favorito" title="Quitar de favoritos" data-id="${producto.id}">★</span>
      </div>
      <p>${producto.descripcion}</p>
      <div class="precio">${MONEDA} ${producto.precio}</div>
    `;
    contenedor.appendChild(div);
  });

  document.querySelectorAll('#favoritos-lista .producto').forEach(div => {
    div.addEventListener('click', function(e) {
      if(e.target.classList.contains('estrella-fav')) return;
      const id = this.getAttribute('data-id');
      mostrarModalProducto(id);
    });
  });

  document.querySelectorAll('#favoritos-lista .estrella-fav').forEach(star => {
    star.onclick = function(e) {
      e.stopPropagation();
      toggleFavorito(this.getAttribute('data-id'));
    };
  });
}

function actualizarContadorFavoritos() {
  const favoritos = obtenerFavoritos();
  const contador = document.getElementById('favoritos-contador');
  contador.textContent = favoritos.length > 0 ? favoritos.length : "";
}

window.addEventListener('DOMContentLoaded', () => {
  mostrarProductos();
  mostrarFavoritos();
  mostrarVista('productos');
  actualizarContadorFavoritos();
});

function activarNav(btn) {
  document.querySelectorAll('.pixel-btn-nav').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');
}

function loginAdmin() {
  const pass = document.getElementById('admin-pass').value;
  if (pass === ADMIN_PASS) {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-bienvenida').textContent = "Ingresado como admin";
    if(typeof autoFormularioAdmin === "function") autoFormularioAdmin();
    document.getElementById('admin-error').textContent = '';
  } else {
    document.getElementById('admin-error').textContent = 'Contraseña incorrecta';
  }
}
function logoutAdmin() {
  document.getElementById('admin-login').style.display = '';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-pass').value = '';
  document.getElementById('admin-bienvenida').textContent = "";
}

function mostrarModalProducto(id) {
  const productos = obtenerProductos();
  const prod = productos.find(p => p.id === id);
  if (!prod) return;
  let modal = document.getElementById('modal-producto');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-producto';
    modal.innerHTML = `
      <div class="modal-bg"></div>
      <div class="modal-content">
        <span class="modal-cerrar">&times;</span>
        <img src="" alt="" class="modal-img">
        <h2 class="modal-nombre"></h2>
        <p class="modal-descripcion"></p>
        <div class="modal-precio"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-bg').onclick = cerrarModalProducto;
    modal.querySelector('.modal-cerrar').onclick = cerrarModalProducto;
  }
  modal.querySelector('.modal-img').src = prod.imagen;
  modal.querySelector('.modal-img').alt = prod.nombre;
  modal.querySelector('.modal-nombre').textContent = prod.nombre;
  modal.querySelector('.modal-descripcion').textContent = prod.descripcion;
  modal.querySelector('.modal-precio').textContent = MONEDA + " " + prod.precio;
  modal.style.display = 'flex';
  setTimeout(() => { modal.classList.add('abierto'); }, 10);
}
function cerrarModalProducto() {
  const modal = document.getElementById('modal-producto');
  if (modal) {
    modal.classList.remove('abierto');
    setTimeout(() => { modal.style.display = 'none'; }, 200);
  }
}

function mostrarMensajeExito(texto) {
  let msg = document.getElementById("mensaje-exito");
  if (!msg) {
    msg = document.createElement("div");
    msg.id = "mensaje-exito";
    msg.style.position = "fixed";
    msg.style.bottom = "20px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.background = "#4CAF50";
    msg.style.color = "white";
    msg.style.padding = "10px 20px";
    msg.style.borderRadius = "8px";
    msg.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    msg.style.zIndex = "1000";
    document.body.appendChild(msg);
  }
  msg.textContent = texto;
  msg.style.display = "block";
  setTimeout(() => { msg.style.display = "none"; }, 2500);
}