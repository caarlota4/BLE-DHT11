/*
 * Author: Carlota Moreno
 * Date: 15/03/2024
 */
const noble = require('@abandonware/noble');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'protectedTemperature.txt');
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
                // Convert the float number to a string
                const data = temperature.toString();
                // Write data to the file
                fs.writeFile(filePath, data, { mode: 0o600 }, (err) => {
                    if (err) {
                    return console.error('Error writing to file:', err);
                    }
                    console.log('Data written to file successfully.');
                
                    // Change the permissions of the file to be protected
                    fs.chmod(filePath, 0o400, (err) => {
                    if (err) {
                        return console.error('Error setting file permissions:', err);
                    }
                    console.log('File permissions set to read-only for the owner.');
                    });
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

