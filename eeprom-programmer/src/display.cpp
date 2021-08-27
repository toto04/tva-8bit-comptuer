// #include <Arduino.h>
// #define OUTPUT_ENABLE 2
// #define WRITE_ENABLE 3

// void setAddress(uint16_t address) {
//     for (uint8_t i = 0; i < 11; i++) {
//         digitalWrite(22 + (i * 2), address & 1);
//         address = address >> 1;
//     }
//     delayMicroseconds(2);
// }

// void enableOutput(bool enable) {
//     digitalWrite(OUTPUT_ENABLE, !enable);
//     delayMicroseconds(2);
// }

// uint8_t readEEPROM(uint16_t address) {
//     for (uint8_t i = 0; i < 8; i++) {
//         pinMode(23 + (i * 2), INPUT);
//     }
//     setAddress(address);
//     enableOutput(true);
//     uint8_t data = 0;
//     for (uint8_t i = 0; i < 8; i++) {
//         data += digitalRead(23 + (i * 2)) << i;
//     }
//     return data;
// }

// void writeEEPROM(uint16_t address, uint8_t data) {
//     setAddress(address);
//     enableOutput(false);
//     for (uint8_t i = 0; i < 8; i++) {
//         pinMode(23 + (i * 2), OUTPUT);
//     }

//     for (uint8_t i = 0; i < 8; i++) {
//         digitalWrite(23 + (i * 2), data & 1);
//         data = data >> 1;
//     }
//     digitalWrite(WRITE_ENABLE, LOW);
//     delayMicroseconds(10);
//     digitalWrite(WRITE_ENABLE, HIGH);
//     delay(1);
// }

// void printContent() {
//     for (uint16_t base = 0; base < 2048; base += 16) {
//         byte data[16];
//         for (uint16_t offset = 0; offset < 16; offset++) {
//             data[offset] = readEEPROM(base + offset);
//         }

//         char buf[80];
//         sprintf(buf, "%03x:  %02x %02x %02x %02x %02x %02x %02x %02x   %02x %02x %02x %02x %02x %02x %02x %02x",
//                 base, data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7],
//                 data[8], data[9], data[10], data[11], data[12], data[13], data[14], data[15]);

//         Serial.println(buf);
//     }
// }

// void setup() {
//     // set all address pin to OUTPUT
//     for (uint8_t i = 0; i < 11; i++) {
//         pinMode(22 + (i * 2), OUTPUT);
//     }
//     pinMode(OUTPUT_ENABLE, OUTPUT);
//     pinMode(WRITE_ENABLE, OUTPUT);
//     digitalWrite(WRITE_ENABLE, HIGH);
//     Serial.begin(9600);

//     uint8_t digits[] = {0x77, 0x14, 0x5b, 0x5e, 0x3c, 0x6e, 0x6f, 0x54, 0x7f, 0x7e};

//     Serial.println("blanking!");

//     for (uint8_t i = 0; i < 8; i++) {
//         Serial.print("blanking block ");
//         Serial.println(i);
//         for (uint16_t j = 0; j < 256; j++) {
//             writeEEPROM(256 * i + j, 0x00);
//         }
//     }

//     Serial.println("Began writng!");

//     for (uint16_t i = 0; i < 3; i++) {
//         Serial.print("writing row ");
//         Serial.println(i);

//         uint16_t digitBit = (0b111 << 8) ^ (1 << (i + 8));
//         uint8_t b10;

//         switch (i) {
//             // pow DOESNT FUCKING WORK 99 MY ASS
//             case 0:
//                 b10 = 1;
//                 break;
//             case 1:
//                 b10 = 10;
//                 break;
//             case 2:
//                 b10 = 100;
//                 break;
//         }

//         for (uint16_t j = 0; j < 256; j++) {
//             writeEEPROM(digitBit + j, digits[(j / b10) % 10]);

//             if (i == 2) {
//                 Serial.print(j);
//                 Serial.print("   ");
//                 Serial.print(j / b10);
//                 Serial.print("   ");
//                 Serial.println((j / b10) % 10);
//             }
//         }
//     }

//     Serial.println("Done! printing contents:");
//     printContent();
// }

// void loop() {
//     // put your main code here, to run repeatedly:
//     delay(60000);
// }