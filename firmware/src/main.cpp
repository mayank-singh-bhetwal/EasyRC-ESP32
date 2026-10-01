#include <Arduino.h>
#include <RF24.h>

#define PIN_CE 16
#define PIN_CSN 17

RF24 radio(PIN_CE, PIN_CSN);
const byte address[6] = "00001";

struct DataPacket {
  int32_t lx, ly, rx, ry;
};

DataPacket data = {0, 0, 0, 0};

void initializeRadio() {
  while (!radio.begin()) {
    Serial.println("nRF24L01 hardware not responding!");
    delay(1000);
  }

  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_250KBPS);
  radio.setChannel(100);
}

#ifdef TRANSMITTER
void setup() {
  Serial.begin(115200);
  delay(500);

  initializeRadio();

  radio.openWritingPipe(address);
  radio.stopListening();

  delay(100);
  pinMode(LED_BUILTIN, OUTPUT);
  delay(100);

  Serial.println("ESP32 Transmitter Ready");
  delay(100);
}

uint32_t lastTransmitted = millis();
char rxBuffer[64];
size_t rxIndex = 0;

void loop() {
  if (millis() - lastTransmitted >= 20) {
    radio.write(&data, sizeof(data));
    lastTransmitted = millis();
  }

  if (Serial.available() > 0) {
    static int i = 0;
    static int32_t num = 0;
    static int arr[4] = {0, 0, 0, 0};

    char c = Serial.read();

    if (c == '\r') {
      return;
    }

    if (c == ',') {
      i = (i + 1) % 4;
      return;
    }

    if (c == '\n') {
      data.lx = arr[0];
      data.ly = arr[1];
      data.rx = arr[2];
      data.ry = arr[3];

      i = 0;

      for (int i = 0; i < 4; i++) {
        arr[i] = 0;
      }

      return;
    }

    arr[i] = arr[i] * 10 + (c - '0');
  }
}
#endif

#ifdef RECEIVER
#include <ESP32Servo.h>

Servo servo1;
Servo servo2;
Servo servo3;
Servo servo4;

#define SERVO1_PIN 13
#define SERVO2_PIN 14
#define SERVO3_PIN 27
#define SERVO4_PIN 26

void setup() {
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  servo1.setPeriodHertz(50);
  servo2.setPeriodHertz(50);
  servo3.setPeriodHertz(50);
  servo4.setPeriodHertz(50);

  servo1.attach(SERVO1_PIN, 500, 2400);
  servo2.attach(SERVO2_PIN, 500, 2400);
  servo3.attach(SERVO3_PIN, 500, 2400);
  servo4.attach(SERVO4_PIN, 500, 2400);
  delay(100);

  initializeRadio();

  radio.openReadingPipe(1, address);
  radio.startListening();

  Serial.begin(115200);
  delay(500);
  Serial.println("ESP32 Transmitter Ready");
  delay(100);
}

int lastWrite = 0;

void loop() {
  if (radio.available()) {
    radio.read(&data, sizeof(data));
  }

  if (millis() - lastWrite >= 20) {
    servo1.write(data.lx);
    servo2.write(data.ly);
    servo3.write(data.rx);
    servo4.write(data.ry);

    lastWrite = millis();
  }
}
#endif
