# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Skogsmart** is a Swedish IoT forest monitoring system, part of the **Smart2 (Smartikvadrat)** brand.
It enables Swedish forest owners and forestry companies to monitor forest environmental conditions
to detect stress and support forest health decisions via LoRaWAN wireless sensor networks
deployed in forests.

**Purpose:** This project is being built from scratch with clean architecture. It serves both as a
real product and as a portfolio project demonstrating full-stack IoT development skills.

**Developer:** Erik Akerman - Computer Engineering graduate, Lund, Sweden. Background in project
management, quality analysis, and IoT/LoRaWAN internship.

---

## Data Flow

Heltec WiFi LoRa 32 V3 (ESP32-S3 + SX1262) sensors --> LoRaWAN --> The Things Network (TTN) --> TTN Webhook --> Backend API --> PostgreSQL --> React Frontend Dashboard

---

## Repository Structure

skogsmart/
|-- firmware/       # PlatformIO - ESP32-S3 / Heltec WiFi LoRa 32 V3 C/C++
|-- backend/        # FastAPI - Python REST API + TTN integration
|-- frontend/       # React - dashboard web app
|-- docs/           # Architecture decisions, API specs, domain notes
`-- CLAUDE.md

---

## Layer 1: Firmware

**Hardware:** Heltec WiFi LoRa 32 V3.2
**MCU:** ESP32-S3
**LoRa chip:** SX1262
**USB:** Type-C
**Sleep current:** ~15 µA on battery
**Framework:** Arduino via PlatformIO
**Language:** C/C++
**Communication:** LoRaWAN -> The Things Network (TTN)

### Project Layout

firmware/
|-- node/       # Sender - simulates a forest sensor node
`-- gateway/    # Receiver - simulates a base station / gateway

### Build & Flash Commands

# Node (sensor)
cd firmware/node
pio run                                          # compile
pio run --target upload                          # compile and flash
pio run --target upload --target monitor         # flash and open serial monitor
pio device monitor                               # serial monitor only

# Gateway (base station)
cd firmware/gateway
pio run
pio run --target upload
pio run --target upload --target monitor

### Key Firmware Concepts

- Sensors: Capacitive soil moisture, soil temperature, air temperature + humidity (DHT22 or SHT31), battery level. RSSI logged by gateway automatically (no payload bytes). Optional future sensors: light level, rain detection, bark beetle trap counter.
- LoRaWAN: Uses OTAA (Over-The-Air Activation). Device EUI, App EUI, App Key stored in secrets.h (never committed).
- Payload encoding: Compact binary payloads (CayenneLPP or custom byte-packed structs) to minimize airtime.
- Deep sleep: wake -> read sensors -> transmit -> sleep (~15 µA sleep current on battery).
- Never commit TTN keys. Store in firmware/node/include/secrets.h (git-ignored). Commit secrets.h.example instead.
- SX1262 driver: use Heltec ESP32 library (heltec-automation/Heltec ESP32 Dev-Boards).

---

## Layer 2: Backend / API

**Language:** Python 3.11+
**Framework:** FastAPI
**Database:** PostgreSQL
**ORM / Migrations:** SQLAlchemy + Alembic
**TTN Integration:** TTN HTTP Webhook (POST)

### Run & Test Commands

cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
alembic upgrade head
alembic revision --autogenerate -m "description"
pytest
pytest -v

### Key Backend Concepts

- TTN Webhook endpoint: POST /api/v1/ttn/uplink
- Core entities: Device, SensorReading, Alert, ForestArea
- API routes follow /api/v1/ prefix
- Authentication: JWT for dashboard, shared secret for TTN webhook
- Geographic data: plain lat/lng FLOAT columns (no PostGIS)

### Backend .env (never committed)

DATABASE_URL=postgresql://user:pass@localhost:5432/skogsmart
TTN_WEBHOOK_SECRET=your_ttn_secret
JWT_SECRET=your_jwt_secret

---

## Layer 3: Frontend Dashboard

**Framework:** React with Vite
**Language:** TypeScript
**Charts:** Recharts
**Maps:** Leaflet via react-leaflet
**HTTP / State:** Axios + React Query
**Localization:** Swedish (sv-SE)

### Run & Test Commands

cd frontend
npm install
npm run dev
npm run build
npm test
npm run lint

### Key Frontend Concepts

- Map view: sensor nodes as markers, color = status (green/yellow/red)
- Time-series charts: trap counts, temperature, humidity with date range selection
- Alerts panel: threshold breach events linked to device and forest area
- Key pages: Dashboard, Device detail, Forest area, Alerts, Settings

### Frontend .env (never committed)

VITE_API_BASE_URL=http://localhost:8000

---

## Domain Concepts

- Skogsagare = forest owner (primary end user)
- Bestand = forest stand (management unit)
- Jordfuktighet = soil humidity (primary environmental indicator)
- Marktemperatur = soil temperature
- Alert thresholds: low soil humidity < 25%, high air temperature > 35°C, low battery < 20%
- Granbarkborre (Ips typographus) monitoring is a future optional feature

---

## Agent Instructions

- Backend Architect: API design, database schema, TTN integration architecture
- Senior Developer: FastAPI implementation, SQLAlchemy models, business logic
- Frontend Developer: React components, Vite config, TypeScript
- UI Designer: Dashboard layout, Swedish UX conventions
- Data Analytics Reporter: Sensor data visualization, chart design
- Reality Checker: Pre-release quality gates
- Evidence Collector: UI/visual QA

---

## Coding Conventions

- All commit messages in English
- All code comments in English
- All UI-facing text in Swedish (sv-SE)
- Keep firmware, backend, and frontend as independently runnable units
- Document all TTN payload format changes in docs/payload-format.md
