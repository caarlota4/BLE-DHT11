#BLE-DHT11
## Repository structure

- centralComponent: has the code in node.js to connect to services over BLE and read characteristics. It will connect to our arduino service.
- peripheralComponent: code to be run in our Arduino board or similars.

## Installation

In order to use run this project successfully, you need to install the following packages and libraries, in both the centralComponent and the peripheralComponent.

### CentralComponent
Firstly, we need to install node.js:

```bash

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

```

```bash

sudo apt install -y nodejs

```
Verify the correct installation:

```bash

node -v

npm -v

```

### PeripheralComponent

The following instructions will be executed over the Arduino IDE.

The peripheral used for this project was the ESP32-S3-WROOM-1. Therefore, the board package used was the ESP32 Arduino, and the board was ESP32S3 Dev Module.

For this board, and taking into account the purpose of it, we needed to use a BLE library. When opening the library manager at Sketch > Include Library > Manage Libraries , choose the library ArduinoBLE.

## Usage

### CentralComponent
To run the centralComponent, go to the directory: centralComponent/src/ and run the following:

```bash

node CentralComponent.js

```
### PeripheralComponent
For this we will use again the Arduino IDE. Once our board is connected, after choosing the board and the serial port, we will click on upload.

 
