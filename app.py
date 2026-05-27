from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

def carregar_banco():
    caminho = os.path.join(os.path.dirname(__file__), 'historia.json')
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/jogo')
def jogo():
    return render_template('jogo.html')

@app.route('/api/menu')
def obter_menu():
    """Retorna apenas a lista de histórias disponíveis para a tela inicial."""
    db = carregar_banco()
    return jsonify(db.get("menu", []))

@app.route('/api/no/<id_no>')
def obter_no(id_no):
    """Retorna os dados de um nó específico, independente da história."""
    db = carregar_banco()
    no = db.get("nos", {}).get(id_no)
    if no:
        return jsonify(no)
    return jsonify({"erro": "Nó não encontrado"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)