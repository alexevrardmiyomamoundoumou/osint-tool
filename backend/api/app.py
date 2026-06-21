from flask import Flask, request, jsonify
from flask_cors import CORS 
from modules import dnsmodule, emailsmodule, shodanmodule
from modules import search_module, social_module

app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return jsonify({
        "status": "OSINT API running"
    })

@app.route('/api/recon', methods=['POST'])
def recon():
    data = request.json
    target = data.get('target', '')
    modules = data.get('modules',['dns','emails','shodan','social','search'])

    results = {}
    if 'dns' in modules: results['dns']    = dnsmodule.run(target)
    if 'emails' in modules: results['emails'] = emailsmodule.run(target)
    if 'shodan' in modules: results['shodan'] = shodanmodule.run(target)
    if 'social' in modules: results['social'] = shodanmodule.run(target)
    if 'search' in modules: results['search'] = shodanmodule.run(target)
    return jsonify(results)




if __name__ == '__main__':
    app.run(debug=True)