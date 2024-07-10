/* 
 * Author: Carlota Moreno
 * Usage: open this code with Arduino IDE
 */
#include <ArduinoBLE.h>

BLEService ledService("19B10000-E8F2-537E-4F6C-D104768A1214"); // LED service UUID
BLEIntCharacteristic ledCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite); // LED characteristic UUID

void setup() {
  Serial.begin(9600);
  while (!Serial);
  if (!BLE.begin()) {
    Serial.println("Starting BLE failed!");
    while (1);
  }
  BLE.setLocalName("YourArduinoDeviceName");
  BLE.setAdvertisedService(ledService);
  ledService.addCharacteristic(ledCharacteristic);
  BLE.addService(ledService);
  ledCharacteristic.setValue(0); // Initialize LED off
  BLE.advertise();
  Serial.println("BLE peripheral advertising...");
}

void loop() {
  // Listen for BLE connections and update LED state
  BLEDevice central = BLE.central();
  if (central) {
    Serial.print("Connected to central: ");
    Serial.println(central.address());
    while (central.connected()) {
      if (ledCharacteristic.written()) {
        if (ledCharacteristic.value()) {
          Serial.println("LED ON");
          // Turn LED on
        } else {
          Serial.println("LED OFF");
          // Turn LED off
        }
      }
    }
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }
}
