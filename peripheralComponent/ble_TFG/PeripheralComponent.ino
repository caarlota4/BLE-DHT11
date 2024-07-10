#include <ArduinoBLE.h>
#include <Arduino.h>
#include <DHT.h>

#define DHT_PIN 18      // Define the DHT sensor pin
#define DHT_TYPE DHT11 // Define the DHT sensor type (DHT11 or DHT22)

#define TEMPERATURE_SERVICE_UUID "19B10000-E8F2-537E-4F6C-D104768A1214"
#define TEMPERATURE_CHARACTERISTIC_UUID "19B10001-E8F2-537E-4F6C-D104768A1214"

float storedTemperature = 0.0;//Variable used to store the temperature last sent to the server
float actualTemp = 0.0;//Variable used to store the read temperature
DHT dht(DHT_PIN, DHT_TYPE); // Initialize DHT sensor

BLEService temperatureService(TEMPERATURE_SERVICE_UUID); // LED service UUID
BLEFloatCharacteristic temperatureCharacteristic(TEMPERATURE_CHARACTERISTIC_UUID, BLERead | BLENotify); // LED characteristic UUID

void setup() {
  Serial.begin(9600);  // Start serial communication

  //Initialize temp sensor and do initial read
  dht.begin(); 
  float storedTemperature = dht.readTemperature();
  
  //Initialize BLE
  if(!BLE.begin()){
    Serial.println("Starting BLE failed!");
    }

  //Set up the BLE device
  BLE.setLocalName("ESP32-board");//Set the arduino device name
  BLE.setAdvertisedService(temperatureService);

  //Add characteristics to the service
  temperatureService.addCharacteristic(temperatureCharacteristic);

  //Advertise the service
  BLE.addService(temperatureService);

  //Start advertising
  //tempCharacteristic.setValue(0); // Initialize LED off
  BLE.advertise();
  Serial.println("BLE peripheral initialized...");

}

void loop() {
  BLEDevice central = BLE.central();

  //Check if the connection was established correctly.
  if(central){
    Serial.print("Connected to central: ");
    Serial.println(central.address());

    //Send initial temperature
    temperatureCharacteristic.writeValue(storedTemperature);

    //Loop while connected
    while(central.connected()){
      // Read temperature
      actualTemp = dht.readTemperature(); // Read temperature in Celsius
      
      if (isnan(actualTemp)) {
        //Temp read not okay
        Serial.println("Failed to read temperature from DHT sensor!");
        
      } else if(actualTemp != storedTemperature){
        //Temp read is different from saved, we need to update the characteristic
        
        Serial.print("Temperature: ");
        Serial.print(actualTemp);
        Serial.println(" °C");

        storedTemperature = actualTemp;
        temperatureCharacteristic.writeValue(storedTemperature);
      }
    
      delay(1000); // Wait for 1 second
      }
      Serial.print("Disconnected from central: ");
      Serial.println(central.address());
      // Properly stop the BLE and end the application
      BLE.stopAdvertise();
      BLE.end();
      Serial.println("BLE application stopped. Entering infinite loop to halt.");
      while (true) {
        // Halt the program
      }
  }
}
