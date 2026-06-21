import requests
import re

def run(target):
    result = {}
    emails_found = set()

    try:
        # Recherche via Hunter.io (sans clé = limité mais fonctionnel)
        url = f"https://hunter.io/v2/domain-search?domain={target}&api_key=YOUR_API_KEY"
        # Sans clé API, on cherche via DuckDuckGo
        search_url = f"https://api.duckduckgo.com/?q=email+{target}&format=json"
        r = requests.get(search_url, timeout=5)
        data = r.json()

        # Extraire emails depuis les résultats
        text = str(data)
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@' + re.escape(target), text)
        emails_found.update(emails)

        result["emails"] = list(emails_found)
        result["search_url"] = f"https://www.google.com/search?q=email+site:{target}"
        result["status"] = "ok"

    except Exception as e:
        result["error"] = str(e)
        result["emails"] = []

    return result