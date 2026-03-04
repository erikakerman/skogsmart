# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Skogsmart** is a Swedish IoT forest monitoring system, part of the **Smart2 (Smartikvadrat)** brand.
It enables Swedish forest owners and forestry companies to monitor bark beetle (*Ips typographus* -
granbarkborre) infestations and environmental conditions via LoRaWAN wireless sensor networks
deployed in forests.

**Purpose:** This project is being built from scratch with clean architecture. It serves both as a
real product and as a portfolio project demonstrating full-stack IoT development skills.

**Developer:** Erik Akerman - Computer Engineering graduate, Lund, Sweden. Background in project
management, quality analysis, and IoT/LoRaWAN internship.

---

## Data Flow

ESP32/LoRa32 sensors --> LoRaWAN --> The Things Network (TTN) --> TTN Webhook --> Backend API --> PostgreSQL --> React Frontend Dashboard

---

## Repository Structure

skogsmart/
|-- firmware/       # PlatformIO - ESP32/LoRa32 C/C++
|-- backend/        # FastAPI - Python REST API + TTN integration
|-- frontend/       # React - dashboard web app
|-- docs/           # Architecture decisions, API specs, domain notes
`-- CLAUDE.md

---

## Layer 1: Firmware

**Hardware:** TTGO LoRa32 (ESP32 + SX1276 LoRa radio)
**Framework:** Arduino via PlatformIO
**Language:** C/C++
**Communication:** LoRaWAN -> The Things Network (TTN)

### Build & Flash Commands

cd firmware
pio run                                          # compile
pio run --target upload                          # compile and flash
pio run --target upload --target monitor         # flash and open serial monitor
pio device monitor                               # serial monitor only
pio test                                         # run unit tests

### Key Firmware Concepts

- Sensors: Bark beetle pheromone trap counter (pulse/interrupt-based), DHT/SHT temperature + humidity
- LoRaWAN: Uses OTAA (Over-The-Air Activation). Device EUI, App EUI, App Key stored in secrets.h (never committed).
- Payload encoding: Compact binary payloads (CayenneLPP or custom byte-packed structs) to minimize airtime.
- Deep sleep: wake -> read sensors -> transmit -> sleep.
- Never commit TTN keys. Store in firmware/include/secrets.h (git-ignored). Commit secrets.h.example instead.

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

- Granbarkborre = Ips typographus = spruce bark beetle (primary target pest)
- Fallor = pheromone traps
- Skogsagare = forest owner (primary end user)
- Bestand = forest stand (management unit)
- Trap counters are cumulative; backend computes delta between readings
- Alert thresholds based on Ips typographus outbreak risk guidance
- Beetle activity peaks May-July in Sweden

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
