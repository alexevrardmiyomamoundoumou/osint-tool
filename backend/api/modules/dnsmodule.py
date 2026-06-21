import whois
import dns.resolver
import re

def is_email(target):
    return bool(re.match(r'^[^@]+@[^@]+\.[^@]+$', target))

def is_ip(target):
    return bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', target))

def run(target):
    result = {"ips": [], "whois": {}, "mx": [], "ns": [], "txt": []}

    # ── si c'est un email → extraire le domaine
    if is_email(target):
        domain = target.split("@")[1]
        result["note"] = f"Email détecté — analyse du domaine : {domain}"
    elif is_ip(target):
        result["note"] = "Cible IP — WHOIS et DNS A non applicables"
        result["ips"] = [target]
        return result
    else:
        domain = target

    # ── Enregistrements A (IPs) ───────────────────────────────────────────────
    try:
        records = dns.resolver.resolve(domain, 'A')
        result["ips"] = [r.address for r in records]
    except Exception as e:
        result["dns_error"] = str(e)

    # ── Enregistrements MX ────────────────────────────────────────────────────
    try:
        mx = dns.resolver.resolve(domain, 'MX')
        result["mx"] = [str(r.exchange) for r in mx]
    except Exception:
        result["mx"] = []

    # ── Enregistrements NS ────────────────────────────────────────────────────
    try:
        ns = dns.resolver.resolve(domain, 'NS')
        result["ns"] = [str(r) for r in ns]
    except Exception:
        result["ns"] = []

    # ── Enregistrements TXT ───────────────────────────────────────────────────
    try:
        txt = dns.resolver.resolve(domain, 'TXT')
        result["txt"] = [r.to_text() for r in txt]
    except Exception:
        result["txt"] = []

    # ── WHOIS ─────────────────────────────────────────────────────────────────
    try:
        w = whois.whois(domain)

        def safe(val):
            if val is None:
                return None
            if isinstance(val, list):
                return [str(v) for v in val]
            return str(val)

        result["whois"] = {
            "registrar":       safe(w.registrar),
            "creation_date":   safe(w.creation_date),
            "expiration_date": safe(w.expiration_date),
            "updated_date":    safe(w.updated_date),
            "name_servers":    safe(w.name_servers),
            "status":          safe(w.status),
            "emails":          safe(w.emails),
            "org":             safe(w.org),
            "country":         safe(w.country),
        }
    except Exception as e:
        result["whois"] = {}
        result["whois_error"] = f"WHOIS non disponible : {str(e)[:100]}"

    return result