const MONEDA = "S/";
const ADMIN_PASS = "admin123";

// Obtiene todos los productos desde Firestore
async function obtenerProductos() {
  const snapshot = await db.collection("productos").orderBy("nombre").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Guarda un producto en Firestore
async function guardarProductoFirestore(producto) {
  await db.collection("productos").add(producto);
}

// Muestra productos en la página
async function mostrarProductos() {
  const productos = await obtenerProductos();
  const favoritos = obtenerFavoritos();
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';
  productos.forEach(producto => {
    const esFavorito = favoritos.includes(producto.id);
    const div = document.createElement('div');
    div.className = 'producto';
    div.setAttribute('data-id', producto.id);
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="categoria">${producto.categoria || ''}</div>
      <div class="titulo-fav">
        <h3>${producto.nombre}</h3>
        <span class="estrella-fav${esFavorito ? ' favorito' : ''}" title="${esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}" data-id="${producto.id}">${esFavorito ? '★' : '☆'}</span>
      </div>
      <p>${producto.descripcion || ''}</p>
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

// Guardar favoritos en localStorage (puedes mantenerlo local)
function obtenerFavoritos() {
  return JSON.parse(localStorage.getItem("vistete_favoritos")) || [];
}
function guardarFavoritos(favs) {
  localStorage.setItem("vistete_favoritos", JSON.stringify(favs));
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
async function mostrarFavoritos() {
  const productos = await obtenerProductos();
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
      <div class="categoria">${producto.categoria || ''}</div>
      <div class="titulo-fav">
        <h3>${producto.nombre}</h3>
        <span class="estrella-fav favorito" title="Quitar de favoritos" data-id="${producto.id}">★</span>
      </div>
      <p>${producto.descripcion || ''}</p>
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

// Modal producto (igual que antes)
async function mostrarModalProducto(id) {
  const productos = await obtenerProductos();
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

// Mostrar mensaje de éxito
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

// ADMIN: Agregar productos
function agregarFormularioProducto() {
  const contenedor = document.getElementById("contenedor-formularios");
  const div = document.createElement("div");
  div.className = "formulario-producto";
  div.innerHTML = `
    <input class="pixel-input" type="text" placeholder="Nombre" autocomplete="off">
    <input class="pixel-input" type="text" placeholder="Descripción" autocomplete="off">
    <input class="pixel-input" type="number" placeholder="Precio (S/)" min="1">
    <input class="pixel-input" type="file" accept="image/*">
    <select class="pixel-input">
      <option value="">Categoría...</option>
      <option value="Ropa">Ropa</option>
      <option value="Accesorios">Accesorios</option>
      <option value="Calzado">Calzado</option>
      <option value="Otro">Otro</option>
    </select>
    <button class="pixel-btn" type="button">Guardar producto</button>
    <hr style="margin:1em 0;">
  `;
  const btnGuardar = div.querySelector("button");
  btnGuardar.onclick = async function() {
    await guardarEsteProducto(div, btnGuardar);
  };
  contenedor.appendChild(div);
}

function autoFormularioAdmin() {
  const contenedor = document.getElementById("contenedor-formularios");
  contenedor.innerHTML = '';
  agregarFormularioProducto();
}

async function guardarEsteProducto(div, btn) {
  const inputs = div.querySelectorAll(".pixel-input");
  const nombre = inputs[0].value.trim();
  const descripcion = inputs[1].value.trim();
  const precio = parseFloat(inputs[2].value.trim());
  const imagenInput = inputs[3];
  const imagenFile = imagenInput.files[0];
  const categoria = inputs[4].value.trim();

  // Validación de imagen
  if (imagenFile && imagenFile.size > 120 * 1024) {
    alert("La imagen es demasiado grande. Usa una imagen menor a 120 KB.");
    btn.disabled = false;
    btn.textContent = "Guardar producto";
    return;
  }
  if (!nombre || !descripcion || isNaN(precio) || !imagenFile || !categoria) {
    alert("Completa todos los campos correctamente.");
    return;
  }
  btn.disabled = true;
  btn.textContent = "Guardando...";

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const imagen = e.target.result;
      await guardarProductoFirestore({
        nombre,
        descripcion,
        precio,
        imagen,
        categoria
      });
      mostrarMensajeExito("Producto agregado exitosamente.");
      div.remove();
      agregarFormularioProducto();
      await mostrarProductos();
      if (typeof mostrarFavoritos === "function") mostrarFavoritos();
    } catch (err) {
      alert("Error al guardar el producto: " + err.message);
      btn.disabled = false;
      btn.textContent = "Guardar producto";
    }
  };
  reader.onerror = function() {
    alert("Error leyendo la imagen. Intenta con otra imagen o revisa el archivo.");
    btn.disabled = false;
    btn.textContent = "Guardar producto";
  };
  reader.readAsDataURL(imagenFile);
}

// ADMIN: Login/logout
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

// Mostrar la vista
function mostrarVista(vista) {
  document.getElementById('vista-productos').classList.add('oculto');
  document.getElementById('vista-favoritos').classList.add('oculto');
  document.getElementById('vista-admin').classList.add('oculto');
  if(vista === 'productos') document.getElementById('vista-productos').classList.remove('oculto');
  if(vista === 'favoritos') document.getElementById('vista-favoritos').classList.remove('oculto');
  if(vista === 'admin') {
    document.getElementById('vista-admin').classList.remove('oculto');
    autoFormularioAdmin();
  }
}
function activarNav(btn) {
  document.querySelectorAll('.pixel-btn-nav').forEach(b => b.classList.remove('activo'));
  btn.classList.add('activo');
}

window.addEventListener('DOMContentLoaded', async () => {
  await mostrarProductos();
  await mostrarFavoritos();
  mostrarVista('productos');
  actualizarContadorFavoritos();
});
