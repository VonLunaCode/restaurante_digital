from flask import Flask, request, jsonify
# IMPORTA LA NUEVA LIBRERÍA
from flask_cors import CORS 

app = Flask(__name__)
# APLICA CORS A TU APP (Permite la comunicación desde CUALQUIER origen)
CORS(app)
# --- Base de Datos del Restaurante (Menú Fijo) ---
MENU = {
    'HAMBUR': 10.00,
    'PAPAS': 5.00,
    'REFRESCO': 3.00,
    'AGUA': 2.50
}
ordenes_registradas = []
next_order_id = 1

# --- Endpoint: POST /api/ordenes ---
@app.route('/api/ordenes', methods=['POST'])
def procesar_orden():
    global next_order_id 
    
    # 1. Recibir los datos JSON
    data = request.get_json() 

    # Validación de datos y estructura
    if not data or 'mesa' not in data or 'items' not in data or not data['items']:
        return jsonify({"status": "error", "message": "Estructura de la orden inválida."}), 400

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
        "mesa": data['mesa'],
        "items": data['items'],
        "total": round(total_calculado, 2),
        "hora": next_order_id, # Placeholder para la hora
        "estado": "Recibida"
    }
    ordenes_registradas.append(nueva_orden)
    next_order_id += 1
    
    # 4. Generador de Respuesta (Confirmación)
    return jsonify({
        "status": "ok",
        "order_id": nueva_orden['order_id'],
        "total": nueva_orden['total'],
        "message": f"Orden #{nueva_orden['order_id']} recibida. Total: ${nueva_orden['total']}."
    }), 201 

if __name__ == '__main__':
    # '0.0.0.0' hace que Flask sea accesible desde tu IP local (ej. 192.168.1.X)
    app.run(host='0.0.0.0', port=5000, debug=True)