import requests
import re

def run(target):
    """
    Recherche de présence sociale autour d'un domaine ou d'un username.
    Pas d'API requise — liens de recherche + scraping léger DuckDuckGo.
    """
    result = {}

    # Liens de recherche directs
    result["linkedin"]  = f"https://www.linkedin.com/search/results/all/?keywords={target}"
    result["twitter"]   = f"https://twitter.com/search?q={target}"
    result["instagram"] = f"https://www.instagram.com/{target}/"
    result["github"]    = f"https://github.com/{target}"
    result["facebook"]  = f"https://www.facebook.com/search/top?q={target}"

    # Recherche DuckDuckGo pour trouver des profils publics
    mentions = []
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        url = f"https://api.duckduckgo.com/?q={target}+site:linkedin.com+OR+site:twitter.com&format=json"
        r = requests.get(url, headers=headers, timeout=5)
        data = r.json()

        for topic in data.get("RelatedTopics", [])[:8]:
            text = topic.get("Text", "")
            href = topic.get("FirstURL", "")
            if text and href:
                mentions.append({"text": text, "url": href})

        result["mentions"] = mentions

    except Exception as e:
        result["mentions"] = []
        result["error"] = str(e)

    # Détection username vs domaine
    is_domain = "." in target
    if is_domain:
        result["note"] = f"Recherche sociale pour le domaine : {target}"
    else:
        result["note"] = f"Recherche de profil pour l'utilisateur : {target}"

    result["status"] = "ok"
    return result