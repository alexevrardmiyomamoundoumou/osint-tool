import requests
import re

# Dorks prédéfinis par catégorie
DORK_TEMPLATES = [
    'site:{target} filetype:pdf',
    'site:{target} filetype:xls OR filetype:xlsx',
    'site:{target} inurl:admin OR inurl:login',
    'site:{target} intitle:"index of"',
    '"@{target}" email',
    'site:{target} password OR passwd OR credentials',
]

def build_dorks(target):
    return [d.replace("{target}", target) for d in DORK_TEMPLATES]

def run(target):
    result = {}
    dorks = build_dorks(target)
    result["dorks_used"] = dorks
    results = []

    # Recherche via DuckDuckGo (pas de clé API)
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

        for dork in dorks[:3]:  # limiter à 3 pour éviter le rate limiting
            url = f"https://api.duckduckgo.com/?q={requests.utils.quote(dork)}&format=json&no_redirect=1"
            r = requests.get(url, headers=headers, timeout=5)
            data = r.json()

            # Abstract (résultat direct)
            if data.get("AbstractText"):
                results.append({
                    "title":   data.get("Heading", dork),
                    "url":     data.get("AbstractURL", ""),
                    "snippet": data["AbstractText"][:200],
                    "dork":    dork,
                })

            # Topics liés
            for topic in data.get("RelatedTopics", [])[:2]:
                text = topic.get("Text", "")
                href = topic.get("FirstURL", "")
                if text and href and target.split(".")[0] in href.lower():
                    results.append({
                        "title":   text[:80],
                        "url":     href,
                        "snippet": text[:200],
                        "dork":    dork,
                    })

        result["results"] = results[:10]  # max 10 résultats
        result["google_url"] = f"https://www.google.com/search?q=site:{target}"
        result["status"] = "ok"

    except Exception as e:
        result["results"] = []
        result["error"]   = str(e)
        result["status"]  = "error"

    return result