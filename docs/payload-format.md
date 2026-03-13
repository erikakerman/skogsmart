# Skogsmart Payload Format

## Version 1 — Environmental Monitoring (8 bytes)

All fields are unsigned integers (uint8) unless noted. Multi-byte fields are big-endian.

| Byte(s) | Field            | Type   | Unit    | Range   | Notes                          |
|---------|------------------|--------|---------|---------|-------------------------------|
| 0–1     | deviceID         | uint16 | —       | 0–65535 | Big-endian device identifier  |
| 2       | soilHumidity     | uint8  | %       | 0–100   | Capacitive soil moisture       |
| 3       | soilTemperature  | uint8  | °C      | 0–255   | Soil temperature at sensor depth |
| 4       | airTemperature   | uint8  | °C      | 0–255   | Air temperature (DHT22/SHT31) |
| 5       | airHumidity      | uint8  | %       | 0–100   | Relative air humidity          |
| 6       | batteryLevel     | uint8  | %       | 0–100   | Battery state of charge        |
| 7       | checksum         | uint8  | —       | 0–255   | XOR of bytes 0–6               |

**Total: 8 bytes**

### Checksum

```
checksum = payload[0] ^ payload[1] ^ payload[2] ^ payload[3]
         ^ payload[4] ^ payload[5] ^ payload[6]
```

Discard any packet where the received checksum does not match the calculated value.

### RSSI / SNR

Signal quality (RSSI, SNR) is captured by the gateway/TTN at receive time and logged by the
backend. It does not consume payload bytes.

---

## Alert Thresholds

| Condition              | Threshold        | Severity |
|------------------------|------------------|----------|
| Low soil humidity      | soilHumidity < 25% | LARM   |
| High air temperature   | airTemperature > 35°C | LARM |
| Low battery            | batteryLevel < 20% | VARNING |

---

## Sensors (Hardware)

| Sensor          | Measures                   | Interface |
|-----------------|----------------------------|-----------|
| Capacitive probe | Soil humidity (%)         | ADC       |
| DS18B20 / NTC   | Soil temperature (°C)      | 1-Wire / ADC |
| DHT22 / SHT31   | Air temperature + humidity | 1-Wire / I²C |
| Battery divider | Battery level (%)          | ADC       |

---

## Future / Optional Fields

The following sensors are planned for future payload versions:

- Light level (lux)
- Rain detection (binary)
- Bark beetle trap counter (pulse count delta)

Any changes to the payload format must be documented in this file and versioned.
