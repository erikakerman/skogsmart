# Skogsmart Firmware

PlatformIO projects for the **Heltec WiFi LoRa 32 V3.2** (ESP32-S3 + SX1262, USB-C).

## Two-Device Setup

In the real deployment, sensor nodes talk to **The Things Network** via commercial LoRaWAN gateways.
For local bench development and testing — without TTN infrastructure — two Heltec boards are used
to simulate the full path:

```
[node board]  --LoRa RF--> [gateway board] --Wi-Fi HTTP--> [backend API]
  sensor node                base station                   FastAPI / PostgreSQL
```

| Directory    | Role            | Description                                                         |
|--------------|-----------------|---------------------------------------------------------------------|
| `node/`      | Sensor node     | Reads sensors, encodes payload, transmits LoRa uplink               |
| `gateway/`   | Base station    | Receives LoRa packets, forwards to backend API over Wi-Fi as JSON   |

Both boards are identical hardware; the firmware role differs only in software.

## Hardware

- **Board:** Heltec WiFi LoRa 32 V3.2
- **MCU:** ESP32-S3
- **LoRa chip:** SX1262
- **USB:** Type-C
- **Sleep current:** ~15 µA on battery (node target)

## Build & Flash

```bash
# Sensor node
cd node
pio run                            # compile
pio run --target upload            # flash
pio run --target upload --target monitor   # flash + serial monitor

# Gateway / base station
cd gateway
pio run
pio run --target upload
pio run --target upload --target monitor
```

## First-Time Setup

### Node
1. Copy `node/include/secrets.h.example` → `node/include/secrets.h`
2. Fill in your TTN OTAA credentials (DevEUI, AppEUI, AppKey from TTN console).

### Gateway
1. Copy `gateway/include/secrets.h.example` → `gateway/include/secrets.h`
2. Fill in Wi-Fi SSID/password and the local backend API base URL.

Both `secrets.h` files are git-ignored — **never commit real credentials**.

## Library

Both projects use the **Heltec ESP32 Dev-Boards** library
(`heltec-automation/Heltec ESP32 Dev-Boards`) which provides:
- SX1262 LoRa driver
- LoRaWAN stack (for `node/`)
- OLED display driver

PlatformIO fetches this automatically on first build.

## Production Architecture

In production the `gateway/` board is replaced by a real LoRaWAN gateway
(e.g. RAK7268) connected to TTN, which delivers uplinks via HTTP webhook to
the backend (`POST /api/v1/ttn/uplink`).
