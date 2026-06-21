import shodan
import socket
import os 
from dotenv import load_dotenv
load_dotenv()

SHODAN_API_KEY = os.getenv("SHODAN-API-KEY")

def run(target):
    result = {}
    try:
        # Résoudre le domaine en IP si nécessaire
        ip = socket.gethostbyname(target)
        result["ip"] = ip

        api = shodan.Shodan(SHODAN_API_KEY)
        host = api.host(ip)

        result["org"]       = host.get("org", "N/A")
        result["os"]        = host.get("os", "N/A")
        result["country"]   = host.get("country_name", "N/A")
        result["ports"]     = [s["port"] for s in host.get("data", [])]
        result["hostnames"] = host.get("hostnames", [])
        result["status"]    = "ok"

    except shodan.exception.APIError as e:
        result["error"]  = f"Shodan API: {str(e)}"
        result["status"] = "api_error"
    except socket.gaierror:
        result["error"]  = "Impossible de résoudre le domaine"
        result["status"] = "dns_error"
    except Exception as e:
        result["error"]  = str(e)
        result["status"] = "error"

    return result