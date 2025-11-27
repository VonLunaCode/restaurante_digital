// Agregamos categorías e íconos para mejor visualización
const MENU = [
    { id: 'HAMBUR', nombre: 'Hamburguesa Deluxe', precio: 10.00, cat: 'comida', icon: '🍔' },
    { id: 'PIZZA', nombre: 'Pizza Margarita', precio: 15.00, cat: 'comida', icon: '🍕' },
    { id: 'ENSALADA', nombre: 'Ensalada César', precio: 8.50, cat: 'comida', icon: '🥗' },
    { id: 'PAPAS', nombre: 'Papas Fritas', precio: 5.00, cat: 'comida', icon: '🍟' },
    { id: 'REFRESCO', nombre: 'Refresco Cola', precio: 3.00, cat: 'bebida', icon: '🥤' },
    { id: 'AGUA', nombre: 'Agua Embotellada', precio: 2.50, cat: 'bebida', icon: '💧' },
    { id: 'CERVEZA', nombre: 'Cerveza Artesanal', precio: 6.00, cat: 'bebida', icon: '🍺' },
    { id: 'POSTRE_CHOCO', nombre: 'Pastel de Chocolate', precio: 4.00, cat: 'postre', icon: '🍰' }
];

const API_URL = 'https://restaurantedigital-production.up.railway.app/api/ordenes'; // O tu localhost

// Objeto para guardar el estado de cantidades (ID -> Cantidad)
let ordenActual = {};

// Inicializar
window.onload = () => {
    filtrarMenu(); // Genera el menú inicial
    document.getElementById('mesa-select').addEventListener('change', () => mostrarEstado('Mesa seleccionada.'));
};

// Función para filtrar y redibujar el menú
function filtrarMenu() {
    const filtro = document.getElementById('categoria-filter').value;
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = ''; // Limpiar

    MENU.forEach(item => {
        // Lógica de filtro: Si es "todos" o coincide la categoría
        if (filtro === 'todos' || item.cat === filtro) {
            crearTarjeta(item, grid);
        }
    });
}

// Crea el HTML de una tarjeta individual
function crearTarjeta(item, contenedor) {
    const qty = ordenActual[item.id] || 0; // Recuperar cantidad si ya existía
    
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
        <div class="card-header">
            <span class="card-emoji">${item.icon}</span>
            <h3>${item.nombre}</h3>
            <div class="card-price">$${item.precio.toFixed(2)}</div>
        </div>
        <div class="quantity-control">
            <button class="btn-qty" onclick="cambiarCantidad('${item.id}', -1)">-</button>
            <span class="qty-display" id="qty-${item.id}">${qty}</span>
            <button class="btn-qty" onclick="cambiarCantidad('${item.id}', 1)">+</button>
        </div>
    `;
    contenedor.appendChild(card);
}

// Maneja los botones + y -
function cambiarCantidad(id, delta) {
    if (!ordenActual[id]) ordenActual[id] = 0;
    
    let nuevaCant = ordenActual[id] + delta;
    if (nuevaCant < 0) nuevaCant = 0; // No permitir negativos
    
    ordenActual[id] = nuevaCant;
    
    // Actualizar visualmente solo el número
    const display = document.getElementById(`qty-${id}`);
    if(display) display.textContent = nuevaCant; // Chequeo por si el filtro lo ocultó

    calcularResumen();
}

// Calcular Totales
function calcularResumen() {
    let subtotal = 0;
    let itemsCount = 0;
    
    MENU.forEach(item => {
        const qty = ordenActual[item.id] || 0;
        if (qty > 0) {
            subtotal += item.precio * qty;
            itemsCount += qty;
        }
    });
    
    // Actualizar barra inferior
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('items-count').textContent = `${itemsCount} ítems`;
    
    // Pequeña animación visual en el precio
    const precioLabel = document.getElementById('subtotal');
    precioLabel.style.transform = "scale(1.1)";
    setTimeout(() => precioLabel.style.transform = "scale(1)", 200);
}

function mostrarEstado(msg) {
    document.getElementById('estado-orden').innerHTML = msg;
}

// Envío de Orden (Modificado para usar el objeto ordenActual)
async function enviarOrden() {
    const mesa = document.getElementById('mesa-select').value;
    
    if (mesa === "") {
        alert("⚠️ ¡Selecciona una mesa primero!");
        return;
    }

    // Convertir nuestro mapa de ordenActual al formato que pide el Backend (array de objetos)
    const items = [];
    for (const [id, qty] of Object.entries(ordenActual)) {
        if (qty > 0) {
            items.push({ id: id, qty: qty });
        }
    }

    if (items.length === 0) {
        alert("⚠️ La orden está vacía.");
        return;
    }

    const ordenParaEnviar = { mesa: mesa, items: items };
    mostrarEstado("⏳ Enviando...");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ordenParaEnviar)
        });

        const data = await response.json();

        if (response.ok) {
            mostrarEstado(`✅ ¡Enviado a Cocina! (Orden #${data.order_id})`);
            // Resetear
            ordenActual = {};
            filtrarMenu(); // Redibuja con ceros
            calcularResumen();
        } else {
            mostrarEstado(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        mostrarEstado("🔴 Error de conexión");
        console.error(error);
    }
}