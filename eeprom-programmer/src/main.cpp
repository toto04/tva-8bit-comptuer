#include <Arduino.h>

#define OUTPUT_ENABLE 2
#define WRITE_ENABLE 3

void setAddress(uint16_t address) {
    for (uint8_t i = 0; i < 11; i++) {
        digitalWrite(22 + (i * 2), address & 1);
        address = address >> 1;
    }
    delayMicroseconds(2);
}

void enableOutput(bool enable) {
    digitalWrite(OUTPUT_ENABLE, !enable);
    delayMicroseconds(2);
}

uint8_t readEEPROM(uint16_t address) {
    for (uint8_t i = 0; i < 8; i++) {
        pinMode(23 + (i * 2), INPUT);
    }
    setAddress(address);
    enableOutput(true);
    uint8_t data = 0;
    for (uint8_t i = 0; i < 8; i++) {
        data += digitalRead(23 + (i * 2)) << i;
    }
    return data;
}

void writeEEPROM(uint16_t address, uint8_t data) {
    setAddress(address);
    enableOutput(false);
    for (uint8_t i = 0; i < 8; i++) {
        pinMode(23 + (i * 2), OUTPUT);
    }

    for (uint8_t i = 0; i < 8; i++) {
        digitalWrite(23 + (i * 2), data & 1);
        data = data >> 1;
    }
    digitalWrite(WRITE_ENABLE, LOW);
    delayMicroseconds(10);
    digitalWrite(WRITE_ENABLE, HIGH);
    delay(1);
}

void setup() {
    // set all address pin to OUTPUT
    for (uint8_t i = 0; i < 11; i++) {
        pinMode(22 + (i * 2), OUTPUT);
    }
    pinMode(OUTPUT_ENABLE, OUTPUT);
    pinMode(WRITE_ENABLE, OUTPUT);
    digitalWrite(WRITE_ENABLE, HIGH);

    Serial.begin(115200);
}

uint8_t lngth[2];
uint8_t code[2048];
uint16_t length = 0;

void loop() {
    if (Serial.available() > 0) {
        switch (Serial.read()) {
            case 0x01:  // connection requested, next two bytes will be lenght, then
                Serial.write(0x01);
                Serial.readBytes(lngth, 2);
                length = (lngth[0] << 8) + lngth[1];
                Serial.write(lngth, 2);
                uint16_t remainingLength = length;
                while (remainingLength >= 32) {
                    Serial.readBytes(code + (length - remainingLength), 32);
                    remainingLength -= 32;
                }
                if (remainingLength)
                    Serial.readBytes(code + (length - remainingLength), remainingLength);

                for (uint16_t i = 0; i < length; i++) {
                    writeEEPROM(i, code[i]);
                }
                for (uint16_t i = 0; i < length; i++) {
                    Serial.write(readEEPROM(i));
                }
                break;

                // other cases, other commands
        }
    }
}