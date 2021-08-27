#include <Arduino.h>

#include "./code.c"
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

bool printContent() {
    bool error = false;
    for (uint16_t base = 0; base < sizeof(code); base += 16) {
        byte data[16];
        for (uint16_t offset = 0; offset < 16; offset++) {
            data[offset] = readEEPROM(base + offset);
            if (data[offset] != code[base + offset]) {
                Serial.print('*');
                error = true;
            }
        }

        char buf[80];
        sprintf(buf, "%03x:  %02x %02x %02x %02x %02x %02x %02x %02x   %02x %02x %02x %02x %02x %02x %02x %02x",
                base, data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7],
                data[8], data[9], data[10], data[11], data[12], data[13], data[14], data[15]);

        Serial.println(buf);
    }
    return !error;
}

void setup() {
    // set all address pin to OUTPUT
    for (uint8_t i = 0; i < 11; i++) {
        pinMode(22 + (i * 2), OUTPUT);
    }
    pinMode(OUTPUT_ENABLE, OUTPUT);
    pinMode(WRITE_ENABLE, OUTPUT);
    digitalWrite(WRITE_ENABLE, HIGH);
    Serial.begin(9600);

    for (uint16_t i = 0; i < sizeof(code); i++) {
        writeEEPROM(i, code[i]);
    }

    Serial.println("Done! printing contents:");
    if (printContent())
        Serial.println("All good! <3");
    else
        Serial.println("--------------\nGASP!!! Error detected!!! :(\n--------------");
}

void loop() {
    // put your main code here, to run repeatedly:
    delay(60000);
}