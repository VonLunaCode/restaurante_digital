from flask import Flask, request, jsonify
from flask_cors import CORS
# Importar la librería para manejar la hora
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- Base de Datos del Restaurante (Menú Extendido) ---
MENU = {
    'HAMBUR': 10.00,
    'PAPAS': 5.00,
    'REFRESCO': 3.00,
    'AGUA': 2.50,
    'PIZZA': 15.00,        # Nuevo ítem
    'ENSALADA': 8.50,     # Nuevo ítem
    'POSTRE_CHOCO': 4.00, # Nuevo ítem
    'CERVEZA': 6.00       # Nuevo ítem
}
ordenes_registradas = []
next_order_id = 1

# --- Endpoint: POST /api/ordenes ---
@app.route('/api/ordenes', methods=['POST'])
def procesar_orden():
    global next_order_id 
    
    # 1. Recibir los datos JSON
    data = request.get_json() 

    # Validación de datos y estructura (incluyendo la mesa)
    if not data or 'mesa' not in data or 'items' not in data or not data['items']:
        return jsonify({"status": "error", "message": "Estructura de la orden inválida (mesa o items faltantes)."}), 400

    # Validar que el número de mesa sea positivo
    try:
        mesa = int(data['mesa'])
        if mesa <= 0:
            return jsonify({"status": "error", "message": "Número de mesa inválido."}), 400
    except ValueError:
         return jsonify({"status": "error", "message": "El número de mesa debe ser un entero."}), 400


    # 2. Procesador de Órdenes (Lógica de Negocio)
    total_calculado = 0.0
    
    for item in data['items']:
        item_id = item.get('id')
        qty = item.get('qty', 0)
        
        # Validación de existencia y cantidad
        if item_id not in MENU:
             return jsonify({"status": "error", "message": f"Ítem no válido: {item_id}"}), 400
        
        if qty <= 0:
             return jsonify({"status": "error", "message": f"Cantidad inválida para {item_id}"}), 400
            
        total_calculado += MENU[item_id] * qty

    # 3. Almacén de Órdenes (Persistencia simple)
    nueva_orden = {
        "order_id": next_order_id,
        "mesa": mesa, # Usamos la mesa validada
        "items": data['items'],
        "total": round(total_calculado, 2),
        "hora": datetime.now().strftime("%H:%M:%S"), # Hora real de registro
        "estado": "Recibida"
    }
    ordenes_registradas.append(nueva_orden)
    next_order_id += 1
    
    # 4. Generador de Respuesta (Confirmación)
    return jsonify({
        "status": "ok",
        "order_id": nueva_orden['order_id'],
        "total": nueva_orden['total'],
        "message": f"Orden #{nueva_orden['order_id']} para Mesa {nueva_orden['mesa']} recibida. Total: ${nueva_orden['total']}."
    }), 201 

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)