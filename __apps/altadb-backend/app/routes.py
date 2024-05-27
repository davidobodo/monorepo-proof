from flask import current_app as app
from flask import jsonify, request

@app.route('/')
def index():
    return jsonify({"message": "Welcome to the simple AltaDB Server"})

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"data": "Here is some data from AltaDB Server"}
    return jsonify(data)

@app.route('/api/status', methods=['GET'])
def get_status():
    status = {"status": "Everything is running smoothly from AltaDB Server"}
    return jsonify(status)