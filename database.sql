-- PostgreSQL : stocker les résultats
CREATE TABLE investigations (
    id SERIAL PRIMARY KEY,
    target VARCHAR(255),
    module VARCHAR(100),
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    domain VARCHAR(255),
    created_at TIMESTAMP
);

CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    organization_id INT,
    domain_name VARCHAR(255),
    status VARCHAR(50)
);

CREATE TABLE subdomains (
    id SERIAL PRIMARY KEY,
    domain_id INT,
    hostname VARCHAR(255),
    ip_address VARCHAR(100),
    first_seen TIMESTAMP,
    last_seen TIMESTAMP
);

CREATE TABLE ip_addresses (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(50),
    country VARCHAR(100),
    asn VARCHAR(100)
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    severity VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP
);