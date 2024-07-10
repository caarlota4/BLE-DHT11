/**
 * Author: Carlota Moreno
 * 
 */

//const noble = require('noble-uwp');
//const noble = require('@abandonware/noble');
/*
//UUIDs for the service and characteristic in Arduino BLE peripheral
const TEMPERATURE_SERVICE_UUID = '19B10000-E8F2-537E-4F6C-D104768A1214';
const TEMPERATURE_CHARACTERISTIC_UUID = '19B10001-E8F2-537E-4F6C-D104768A1214';

//Function to start scanning BLE devices
function startScanning(){
  noble.startScanning([], true); //Scans for all BLE devices
  console.log('Scanning for BLE devices...');
}

// Function to handle discovered BLE peripherals
noble.on('discover', peripheral => {
  if (peripheral.advertisement.localName === 'ESP32-board') { // Check if the discovered device is our Arduino peripheral
    console.log('Found ESP32-board!');

    // Stop scanning once the peripheral is found
    noble.stopScanning();

    // Connect to the peripheral
    peripheral.connect(error => {
      if (error) {
        console.error('Error connecting to peripheral:', error);
        return;
      }
      console.log('Connected to peripheral');

      // Discover services and characteristics
      peripheral.discoverSomeServicesAndCharacteristics([TEMPERATURE_SERVICE_UUID], [TEMPERATURE_CHARACTERISTIC_UUID], (error, services, characteristics) => {
        if (error) {
          console.error('Error discovering services and characteristics:', error);
          return;
        }

        const temperatureCharacteristic = characteristics[0];

        // Subscribe to notifications from the temperature characteristic
        temperatureCharacteristic.subscribe(error => {
          if (error) {
            console.error('Error subscribing to temperature characteristic:', error);
            return;
          }
          console.log('Subscribed to temperature updates');

          // Handle incoming data
          temperatureCharacteristic.on('data', data => {
            const temperature = data.readFloatLE(0); // Assuming temperature data is sent as a float
            console.log('Temperature update:', temperature);
          });
        });
      });
    });

    // Handle disconnect event
    peripheral.on('disconnect', () => {
      console.log('Disconnected from peripheral');
      startScanning(); // Resume scanning for peripherals
    });
  }
});

// Start scanning for BLE devices when the noble module is ready
noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    startScanning();
  } else {
    noble.stopScanning();
  }
});


/*
const noble = require('noble');

// Scan for BLE peripherals
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

// Listen for discovered peripherals
noble.on('discover', function(peripheral) {
  // Filter for your Arduino device based on advertised service UUIDs or other characteristics
  if (peripheral.advertisement.localName === 'YourArduinoDeviceName') {
    console.log('Found Arduino Device!');
    noble.stopScanning();
    connectToDevice(peripheral);
  }
});

// Connect to the discovered peripheralmodify the following code to fit the abandonware/noble library? 
function connectToDevice(peripheral) {
  peripheral.connect(function(error) {
    if (error) {
      console.error('Failed to connect:', error);
    } else {
      console.log('Connected to peripheral:', peripheral.uuid);
      // Now you can interact with the peripheral
      // For example, you can listen for characteristic updates or send commands
    }
  });
}*/
const noble = require('@abandonware/noble');

const DEVICE_NAME = 'ESP32-board';
const TEMPERATURE_SERVICE_UUID = '19b10001e8f2537e4f6cd104768a1214';
const TEMPERATURE_CHARACTERISTIC_UUID = '19b10001e8f2537e4f6cd104768a1214';

// Function to convert buffer to float
function bufferToFloat(buffer) {
    return buffer.readFloatLE(0);
}

// Start scanning when Bluetooth state is powered on
noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
        console.log('Bluetooth is powered on, starting scanning...');
        noble.startScanning();
    } else {
        console.log('Bluetooth is not powered on, stopping scanning...');
        noble.stopScanning();
    }
});

// Discover device and connect to it
noble.on('discover', (peripheral) => {
    if (peripheral.advertisement.localName === DEVICE_NAME) {
        console.log(`Found device: ${DEVICE_NAME}`);

        // Stop scanning once we found the device
        noble.stopScanning();

        // Connect to the device
        peripheral.connect((error) => {
            if (error) {
                console.error(`Error connecting to device: ${error}`);
                return;
            }
            console.log('Connected to device');

            // Discover services and characteristics
            peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                if (error) {
                    console.error(`Error discovering services and characteristics: ${error}`);
                    return;
                }

                console.log(`Discovered ${services.length} services and ${characteristics.length} characteristics: `);

                // Print discovered services
                console.log(`Discovered ${services.length} services:`);
                services.forEach((service) => {
                    console.log(`Service UUID: ${service.uuid}`);
                });

                // Print discovered characteristics
                console.log(`Discovered ${characteristics.length} characteristics:`);
                characteristics.forEach((characteristic) => {
                    console.log(`Characteristic UUID: ${characteristic.uuid}`);
                });

                // Find the temperature characteristic
                const temperatureCharacteristic = characteristics.find((char) => char.uuid === TEMPERATURE_CHARACTERISTIC_UUID);

                if (!temperatureCharacteristic) {
                    console.error(`Temperature characteristic with UUID ${TEMPERATURE_CHARACTERISTIC_UUID} not found`);
                    return;
                }

                console.log('Found temperature characteristic, subscribing...');
                // Read the characteristic
                temperatureCharacteristic.read((error, data) => {
                  if (error) {
                      console.error(`Error reading characteristic: ${error}`);
                      return;
                  }
                  const temperature = bufferToFloat(data);
                  console.log(`Temperature read: ${temperature.toFixed(2)}°C`);
                });
                // Subscribe to the characteristic
                
                temperatureCharacteristic.subscribe((error) => {
                    if (error) {
                        console.error(`Error subscribing to characteristic: ${error}`);
                        return;
                    }
                    console.log('Subscribed to temperature characteristic');

                    // Handle data received from the characteristic
                    temperatureCharacteristic.on('data', (data, isNotification) => {
                        const temperature = bufferToFloat(data);
                        console.log(`Temperature update: ${temperature.toFixed(2)}°C`);
                    });
                });
                console.log('Tried to subscribe');
            });
        });

        // Handle disconnection
        peripheral.on('disconnect', () => {
            console.log('Disconnected from device');
            // Optionally restart scanning
            noble.startScanning();
        });
    }
});

