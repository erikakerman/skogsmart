/**
 * Skogsmart — Forest Sensor Node
 *
 * Hardware : Heltec WiFi LoRa 32 V3.2 (ESP32-S3 + SX1262)
 * Radio    : RadioLib SX1262
 * Display  : SSD1306 128×64 OLED
 *
 * Reads real soil moisture from GPIO4 (YL-38/YL-69 AO pin).
 * ADC mapping: 4095 (dry) → 0 %,  1791 (wet) → 100 %
 * All other sensor values are placeholders until hardware is wired.
 * Transmits an 8-byte packet every 30 seconds.
 *
 * Payload layout (8 bytes):
 *   [0..1] deviceID       uint16 big-endian
 *   [2]    soilHumidity   uint8  0–100 %
 *   [3]    soilTemp       uint8  °C + 40 offset
 *   [4]    airTemp        uint8  °C + 40 offset
 *   [5]    airHumidity    uint8  0–100 %
 *   [6]    batteryLevel   uint8  0–100 %
 *   [7]    checksum       uint8  XOR of bytes 0–6
 */

#include <Arduino.h>
#include <RadioLib.h>
#include <SSD1306Wire.h>

// ---------- Pin definitions (Heltec WiFi LoRa 32 V3) ----------
#define LORA_NSS    8
#define LORA_DIO1  14
#define LORA_RESET 12
#define LORA_BUSY  13

#define SDA_OLED   17
#define SCL_OLED   18
#define VEXT_PIN   36

#define SOIL_ADC_PIN  4

// ---------- LoRa parameters ----------
#define LORA_FREQ    868.0f
#define LORA_BW      125.0f
#define LORA_SF      7
#define LORA_CR      5       // 4/5
#define LORA_SYNC    0x12
#define LORA_POWER   14
#define LORA_PREAMBLE 8

// ---------- Node identity ----------
#define DEVICE_ID   0x0001

// ---------- Timing ----------
#define TX_INTERVAL_MS  30000

// ---------- ADC calibration (YL-38/YL-69 on 3.3 V, 12-bit) ----------
#define ADC_DRY  4095
#define ADC_WET  1791

// ---------- Objects ----------
SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_RESET, LORA_BUSY);
SSD1306Wire display(0x3c, SDA_OLED, SCL_OLED);

static unsigned long lastTxMs = 0;
static uint32_t txCount = 0;

// ---------- Helpers ----------

static void vextOn() {
    pinMode(VEXT_PIN, OUTPUT);
    digitalWrite(VEXT_PIN, LOW);  // active-low: LOW powers the OLED
}

static uint8_t readSoilHumidity() {
    int raw = analogRead(SOIL_ADC_PIN);
    long mapped = map((long)raw, ADC_DRY, ADC_WET, 0, 100);
    return (uint8_t)constrain(mapped, 0, 100);
}

static void buildPayload(uint8_t* buf) {
    uint8_t soilHumidity = readSoilHumidity();
    uint8_t soilTemp     = 15 + 40;   // 15 °C placeholder, offset +40
    uint8_t airTemp      = 18 + 40;   // 18 °C placeholder
    uint8_t airHumidity  = 72;        // 72 % placeholder
    uint8_t battery      = 85;        // 85 % placeholder

    buf[0] = (DEVICE_ID >> 8) & 0xFF;
    buf[1] =  DEVICE_ID       & 0xFF;
    buf[2] = soilHumidity;
    buf[3] = soilTemp;
    buf[4] = airTemp;
    buf[5] = airHumidity;
    buf[6] = battery;

    uint8_t xor_ = 0;
    for (int i = 0; i < 7; i++) xor_ ^= buf[i];
    buf[7] = xor_;
}

static void showDisplay(const uint8_t* buf, int state) {
    display.clear();
    display.setFont(ArialMT_Plain_10);

    display.drawString(0, 0,  "Skogsmart Node");
    display.drawString(0, 12, "Jordfukt: " + String(buf[2]) + " %");
    display.drawString(0, 24, "Marktemp: " + String((int)buf[3] - 40) + " C");
    display.drawString(0, 36, "Lufttemp: " + String((int)buf[4] - 40) + " C");
    display.drawString(0, 48, state == 0
        ? "TX #" + String(txCount) + "  OK"
        : "TX #" + String(txCount) + "  ERR " + String(state));

    display.display();
}

// ---------- Arduino entry points ----------

void setup() {
    Serial.begin(115200, SERIAL_8N1, 44, 43);
    delay(1000);

    analogReadResolution(12);
    pinMode(SOIL_ADC_PIN, INPUT);

    vextOn();
    delay(100);
    display.init();
    display.flipScreenVertically();
    display.clear();
    display.setFont(ArialMT_Plain_10);
    display.drawString(0, 0, "Skogsmart");
    display.drawString(0, 12, "Initierar LoRa...");
    display.display();

    Serial.println("\n=== Skogsmart Node ===");

    int state = radio.begin(LORA_FREQ, LORA_BW, LORA_SF, LORA_CR,
                            LORA_SYNC, LORA_POWER, LORA_PREAMBLE);
    if (state != RADIOLIB_ERR_NONE) {
        Serial.printf("LoRa init failed: %d\n", state);
        display.drawString(0, 24, "LoRa ERR " + String(state));
        display.display();
        while (true) delay(1000);
    }

    Serial.println("LoRa ready.");
    display.drawString(0, 24, "LoRa OK");
    display.display();
    delay(1000);
}

void loop() {
    unsigned long now = millis();
    if (now - lastTxMs < TX_INTERVAL_MS) return;
    lastTxMs = now;
    txCount++;

    uint8_t payload[8];
    buildPayload(payload);

    Serial.printf("[TX #%lu] soilHum=%u%% soilTemp=%d airTemp=%d airHum=%u bat=%u%%\n",
                  txCount, payload[2],
                  (int)payload[3] - 40, (int)payload[4] - 40,
                  payload[5], payload[6]);

    int state = radio.transmit(payload, sizeof(payload));

    if (state == RADIOLIB_ERR_NONE) {
        Serial.printf("  Sent OK — %.2f kHz offset\n", radio.getFrequencyError() / 1000.0f);
    } else {
        Serial.printf("  TX failed: %d\n", state);
    }

    showDisplay(payload, state);
}
