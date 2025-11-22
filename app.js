// Menú Local (para mostrar nombres y calcular subtotal)
const MENU = [
    { id: 'HAMBUR', nombre: 'Hamburguesa Deluxe', precio: 10.00 },
    { id: 'PAPAS', nombre: 'Papas Fritas', precio: 5.00 },
    { id: 'REFRESCO', nombre: 'Refresco Cola', precio: 3.00 },
    { id: 'AGUA', nombre: 'Agua Embotellada', precio: 2.50 }
];

const API_URL = 'http://127.0.0.1:5000/api/ordenes';

// Función para generar dinámicamente el menú en la tabla HTML
function generarMenu() {
    const menuBody = document.getElementById('menu-body');
    MENU.forEach(item => {
        const row = menuBody.insertRow();
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td><input type="number" data-id="${item.id}" value="0" min="0" onchange="calcularSubtotal()"></td>
        `;
    });
}

// 1. Cálculo Parcial (Subtotal)
function calcularSubtotal() {
    let subtotal = 0;
    const inputs = document.querySelectorAll('#menu-body input[type="number"]');
    
    inputs.forEach(input => {
        const itemId = input.getAttribute('data-id');
        const qty = parseInt(input.value);
        const menuItem = MENU.find(m => m.id === itemId);
        
        if (qty > 0 && menuItem) {
            subtotal += menuItem.precio * qty;
        }
    });
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
}

// Función auxiliar para mostrar el estado en la interfaz
function mostrarEstado(mensaje) {
    document.getElementById('estado-orden').textContent = mensaje;
}

// 2. Envío de Orden (La Conexión)
async function enviarOrden() {
    // 1. Recopilar la orden actual
    const items = [];
    const inputs = document.querySelectorAll('#menu-body input[type="number"]');
    
    inputs.forEach(input => {
        const itemId = input.getAttribute('data-id');
        const qty = parseInt(input.value);
        if (qty > 0) {
            items.push({ id: itemId, qty: qty });
        }
    });

    if (items.length === 0) {
        mostrarEstado("❌ Por favor, selecciona al menos un ítem.");
        return;
    }

    const ordenParaEnviar = {
        mesa: 1, // Mesa fija para la prueba
        items: items
    };

    mostrarEstado("⏳ Enviando orden a la Cocina...");

    // 2. Petición POST al servidor Flask
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ordenParaEnviar)
        });

        const data = await response.json();

        // 3. Manejar la respuesta
        if (response.ok) { // 2xx status (201 Created)
            mostrarEstado(`✅ Éxito: ${data.message}`);
            // Limpiar las cantidades en la interfaz
            inputs.forEach(input => input.value = 0);
            calcularSubtotal();
        } else { // 4xx o 5xx status (Error)
            mostrarEstado(`❌ Error del servidor: ${data.message}`);
        }
        
    } catch (error) {
        // Error de red (el servidor no está corriendo)
        mostrarEstado(`🔴 ERROR de conexión. Asegúrate que 'app.py' esté corriendo.`);
        console.error("Error al conectar:", error);
    }
}

// Inicializa el menú cuando la página carga
window.onload = () => {
    generarMenu();
    calcularSubtotal(); // Inicializa el subtotal en 0.00
};