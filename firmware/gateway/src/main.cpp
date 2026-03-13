/**
 * Skogsmart — Gateway / Base Station
 *
 * Hardware : Heltec WiFi LoRa 32 V3.2 (ESP32-S3 + SX1262)
 * Role     : LoRa receiver. Decodes 8-byte environmental payloads and displays
 *            results on the OLED. Prints to Serial.
 *
 * Payload format (8 bytes):
 *   [0-1] deviceID        (uint16, big-endian)
 *   [2]   soilHumidity    (uint8, 0–100 %)
 *   [3]   soilTemperature (uint8, °C)
 *   [4]   airTemperature  (uint8, °C)
 *   [5]   airHumidity     (uint8, 0–100 %)
 *   [6]   batteryLevel    (uint8, 0–100 %)
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

#define RF_FREQUENCY  868.0
#define PAYLOAD_SIZE  8

SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_RESET, LORA_BUSY);
SSD1306Wire* display = nullptr;

volatile bool receivedFlag = false;

void IRAM_ATTR setFlag(void) {
    receivedFlag = true;
}

void VextON(void) {
    pinMode(Vext, OUTPUT);
    digitalWrite(Vext, LOW);
}

void setup() {
    // Heltec V3: pull Vext LOW to enable power to OLED and other peripherals
    pinMode(Vext, OUTPUT);
    digitalWrite(Vext, LOW);
    delay(100);

    Serial.begin(115200);

    display = new SSD1306Wire(0x3c, SDA_OLED, SCL_OLED);
    display->init();
    display->setFont(ArialMT_Plain_10);
    display->clear();
    display->drawString(0,  0, "Skogsmart Gateway");
    display->drawString(0, 14, "Starting...");
    display->display();

    // begin(freq, bw, sf, cr, syncWord, power, preamble)
    int state = radio.begin(RF_FREQUENCY, 125.0, 7, 5, 0x12, 14, 8);
    if (state != RADIOLIB_ERR_NONE) {
        Serial.printf("[gateway] Radio init failed, code %d\n", state);
        display->clear();
        display->drawString(0, 0, "Radio FAIL: " + String(state));
        display->display();
        while (true);
    }

    radio.setDio1Action(setFlag);

    state = radio.startReceive();
    if (state != RADIOLIB_ERR_NONE) {
        Serial.printf("[gateway] startReceive failed, code %d\n", state);
        while (true);
    }

    display->clear();
    display->drawString(0,  0, "Skogsmart Gateway");
    display->drawString(0, 14, "Listening...");
    display->display();

    Serial.println("[gateway] Listening for packets...");
}

void loop() {
    if (!receivedFlag) return;
    receivedFlag = false;

    uint8_t buf[PAYLOAD_SIZE];
    int state = radio.readData(buf, PAYLOAD_SIZE);

    if (state != RADIOLIB_ERR_NONE) {
        Serial.printf("[gateway] readData failed, code %d\n", state);
        radio.startReceive();
        return;
    }

    uint16_t deviceID        = ((uint16_t)buf[0] << 8) | buf[1];
    uint8_t  soilHumidity    = buf[2];
    uint8_t  soilTemperature = buf[3];
    uint8_t  airTemperature  = buf[4];
    uint8_t  airHumidity     = buf[5];
    uint8_t  batteryLevel    = buf[6];
    uint8_t  checksum        = buf[7];
    uint8_t  calc = buf[0] ^ buf[1] ^ buf[2] ^ buf[3] ^ buf[4] ^ buf[5] ^ buf[6];
    bool     chkOk = (calc == checksum);

    int16_t rssi = (int16_t)radio.getRSSI();
    int8_t  snr  = (int8_t)radio.getSNR();

    Serial.printf(
        "[gateway] DevID=0x%04X soilHum=%u%% soilTemp=%u°C airTemp=%u°C airHum=%u%% bat=%u%% chk=%s RSSI=%d SNR=%d\n",
        deviceID, soilHumidity, soilTemperature, airTemperature,
        airHumidity, batteryLevel, chkOk ? "OK" : "ERR", rssi, snr
    );

    display->clear();
    display->drawString(0,  0, "Dev: 0x" + String(deviceID, HEX) +
                              " " + String(chkOk ? "OK" : "ERR"));
    display->drawString(0, 13, "Jord: " + String(soilHumidity) + "% " +
                              String(soilTemperature) + "C");
    display->drawString(0, 26, "Luft: " + String(airTemperature) + "C " +
                              String(airHumidity) + "%");
    display->drawString(0, 39, "Bat:  " + String(batteryLevel) + "%");
    display->drawString(0, 52, "RSSI:" + String(rssi) +
                              " SNR:" + String(snr));
    display->display();

    radio.startReceive();
}
