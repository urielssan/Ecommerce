
import mercadopago
import os
import json

# Token de prueba
token = 'TEST-7434557990176378-090912-70697b0956b637500350d876307fa3bd-244346845'
sdk = mercadopago.SDK(token)

preference_data = {
    "items": [
        {
            "title": "Producto de prueba",
            "quantity": 1,
            "currency_id": "ARS",
            "unit_price": 100.0
        }
    ],
    "back_urls": {
        "success": "http://localhost:3000/",
        "failure": "http://localhost:3000/checkout",
        "pending": "http://localhost:3000/checkout"
    },
    "auto_return": "approved"
}

print("Probando conexión a Mercado Pago...")
try:
    preference_response = sdk.preference().create(preference_data)
    preference = preference_response["response"]
    print("Respuesta:", json.dumps(preference, indent=2))
    
    if "init_point" in preference:
        print("SUCCESS! Init point:", preference["init_point"])
    else:
        print("FAILURE. No init_point found.")
except Exception as e:
    print(f"EXCEPTION: {e}")
