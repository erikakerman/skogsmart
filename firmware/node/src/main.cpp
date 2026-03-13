/**
 * Skogsmart — Forest Sensor Node
 *
 * Hardware : Heltec WiFi LoRa 32 V3.2 (ESP32-S3 + SX1262)
 * Role     : LoRa transmitter. Sends an 8-byte environmental payload every 30 s.
 *            Uses fake data for bench testing (no real sensors wired).
 *
 * Payload format (8 bytes):
 *   [0-1] deviceID        (uint16, big-endian) = 0x0001
 *   [2]   soilHumidity    (uint8, 0–100 %) = 42
 *   [3]   soilTemperature (uint8, °C) = 12
 *   [4]   airTemperature  (uint8, °C) = 16
 *   [5]   airHumidity     (uint8, 0–100 %) = 78
 *   [6]   batteryLevel    (uint8, 0–100 %) = 85
 *   [7]   checksum        (XOR of bytes 0–6)
 */

#include <RadioLib.h>
#include <SSD1306Wire.h>

// OLED pins — Heltec WiFi LoRa 32 V3
#define SDA_OLED  17
#define SCL_OLED  18
#define Vext      36

// SX1262 pins — Heltec WiFi LoRa 32 V3
#define LORA_NSS    8
#define LORA_DIO1  14
#define LORA_RESET 12
#define LORA_BUSY  13

#define RF_FREQUENCY    868.0
#define TX_POWER        14
#define PAYLOAD_SIZE    8
#define TX_INTERVAL_MS  30000
#define DEVICE_ID       0x0001

SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_RESET, LORA_BUSY);
SSD1306Wire* display = nullptr;

void sendPacket(void) {
    uint8_t payload[PAYLOAD_SIZE];
    payload[0] = (DEVICE_ID >> 8) & 0xFF;
    payload[1] =  DEVICE_ID       & 0xFF;
    payload[2] = 42;   // fake soilHumidity %
    payload[3] = 12;   // fake soilTemperature °C
    payload[4] = 16;   // fake airTemperature °C
    payload[5] = 78;   // fake airHumidity %
    payload[6] = 85;   // fake batteryLevel %
    payload[7] = payload[0] ^ payload[1] ^ payload[2] ^ payload[3]
               ^ payload[4] ^ payload[5] ^ payload[6];

    Serial.printf("[node] TX DevID=0x%04X soilHum=%u soilTemp=%u airTemp=%u airHum=%u bat=%u\n",
                  DEVICE_ID, payload[2], payload[3], payload[4], payload[5], payload[6]);

    display->clear();
    display->drawString(0,  0, "Skogsmart Node");
    display->drawString(0, 13, "Dev: 0x" + String(DEVICE_ID, HEX));
    display->drawString(0, 26, "Jord:" + String(payload[2]) + "% " + String(payload[3]) + "C");
    display->drawString(0, 39, "Luft:" + String(payload[4]) + "C " + String(payload[5]) + "%");
    display->drawString(0, 52, "Bat:" + String(payload[6]) + "% Sending...");
    display->display();

    int state = radio.transmit(payload, PAYLOAD_SIZE);
    if (state == RADIOLIB_ERR_NONE) {
        Serial.println("[node] TX done. Waiting 30 s...");
    } else {
        Serial.printf("[node] TX failed, code %d. Retrying in 30 s...\n", state);
    }

    display->clear();
    display->drawString(0,  0, "Skogsmart Node");
    display->drawString(0, 13, state == RADIOLIB_ERR_NONE ? "TX done" : "TX FAILED");
    display->drawString(0, 26, "Jord:42% 12C Luft:16C 78%");
    display->drawString(0, 39, "Bat:85%");
    display->drawString(0, 52, "Wait 30s...");
    display->display();
}

void setup() {
    // Heltec V3: pull Vext LOW to enable power to OLED and other peripherals
    pinMode(Vext, OUTPUT);
    digitalWrite(Vext, LOW);
    delay(100);

    Serial.begin(115200, SERIAL_8N1, 44, 43);
    delay(2000);
    Serial.println("=== Skogsmart Node booting ===");

    display = new SSD1306Wire(0x3c, SDA_OLED, SCL_OLED);
    display->init();
    display->setFont(ArialMT_Plain_10);
    display->clear();
    display->drawString(0,  0, "Skogsmart Node");
    display->drawString(0, 14, "Starting...");
    display->display();
    Serial.println("Display OK");

    // begin(freq, bw, sf, cr, syncWord, power, preamble)
    int state = radio.begin(RF_FREQUENCY, 125.0, 7, 5, 0x12, TX_POWER, 8);
    Serial.println("Radio state: " + String(state));
    if (state != RADIOLIB_ERR_NONE) {
        Serial.printf("[node] Radio init failed, code %d\n", state);
        display->clear();
        display->drawString(0, 0, "Radio FAIL: " + String(state));
        display->display();
        while (true);
    }

    sendPacket();
}

void loop() {
    delay(TX_INTERVAL_MS);
    sendPacket();
}
