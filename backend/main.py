from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = FastAPI(title="Skogsmart API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "dbname": "skogsmart",
    "user": "skogsmart",
    "password": "skogsmart123",
    "host": "localhost"
}

def get_db():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

@app.get("/")
def root():
    return {"status": "Skogsmart API running"}

@app.get("/api/readings")
def get_readings(limit: int = 100):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        SELECT r.*, d.name, d.area 
        FROM readings r
        JOIN devices d ON r.device_id = d.device_id
        ORDER BY r.received_at DESC
        LIMIT %s
    """, (limit,))
    rows = cur.fetchall()
    db.close()
    return list(rows)

@app.get("/api/devices")
def get_devices():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM devices")
    rows = cur.fetchall()
    db.close()
    return list(rows)

@app.post("/api/readings")
def post_reading(reading: dict):
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        INSERT INTO readings 
        (device_id, soil_humidity, soil_temperature, air_temperature, 
         air_humidity, battery_level, rssi, snr)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        reading["device_id"],
        reading["soil_humidity"],
        reading["soil_temperature"],
        reading["air_temperature"],
        reading["air_humidity"],
        reading["battery_level"],
        reading.get("rssi"),
        reading.get("snr")
    ))
    db.commit()
    db.close()
    return {"status": "ok"}
