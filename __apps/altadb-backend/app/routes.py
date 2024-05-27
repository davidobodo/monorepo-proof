from flask import current_app as app
from flask import jsonify, request

@app.route('/')
def index():
    return jsonify({"message": "Welcome to the Flask API!"})

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"data": "Here is some data"}
    return jsonify(data)

@app.route('/api/submit', methods=['POST'])
def submit_data():
    data = request.get_json()
    response = {"message": "Data received", "data": data}
    return jsonify(response)

@app.route('/api/status', methods=['GET'])
def get_status():
    status = {"status": "Everything is running smoothly"}
    return jsonify(status)