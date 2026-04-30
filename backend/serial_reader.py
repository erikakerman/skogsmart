#!/usr/bin/env python3
"""
Skogsmart Serial Reader
Reads gateway output from USB serial and POSTs to the FastAPI backend.
"""

import serial
import re
import requests
import time

SERIAL_PORT = "/dev/ttyUSB0"
BAUD_RATE = 115200
API_URL = "http://localhost:8000/api/readings"

# Match gateway output line:
# [gateway] DevID=0x0001 soilHum=42% soilTemp=12°C airTemp=16°C airHum=78% bat=85% chk=OK RSSI=-6 SNR=12
PATTERN = re.compile(
    r'\[gateway\] DevID=0x([0-9A-Fa-f]+) '
    r'soilHum=(\d+)% '
    r'soilTemp=(\d+).C '
    r'airTemp=(\d+).C '
    r'airHum=(\d+)% '
    r'bat=(\d+)% '
    r'chk=(\w+) '
    r'RSSI=(-?\d+) '
    r'SNR=([\d.-]+)'
)

def parse_and_post(line):
    m = PATTERN.search(line)
    if not m:
        return
    if m.group(7) != "OK":
        print(f"[skip] bad checksum: {line.strip()}")
        return

    payload = {
        "device_id": int(m.group(1), 16),
        "soil_humidity": int(m.group(2)),
        "soil_temperature": int(m.group(3)),
        "air_temperature": int(m.group(4)),
        "air_humidity": int(m.group(5)),
        "battery_level": int(m.group(6)),
        "rssi": int(m.group(8)),
        "snr": float(m.group(9))
    }
    print(f"[post] {payload}")
    try:
        r = requests.post(API_URL, json=payload, timeout=5)
        print(f"[ok] status={r.status_code}")
    except Exception as e:
        print(f"[error] {e}")

def main():
    print(f"Opening {SERIAL_PORT} at {BAUD_RATE} baud...")
    while True:
        try:
            with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
                print("Connected. Listening for gateway packets...")
                while True:
                    line = ser.readline().decode("utf-8", errors="ignore")
                    if line:
                        print(f"[rx] {line.strip()}")
                        parse_and_post(line)
        except serial.SerialException as e:
            print(f"[serial error] {e} — retrying in 5s...")
            time.sleep(5)

if __name__ == "__main__":
    main()

