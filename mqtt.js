// Lutron Telnet configuration
const ipAddress = '192.168.15.90'
const port = 23
const login = 'Wellness'
const password = 'FutureCare@dm'

/// AWS IoT configuration
const certPathName = '/home/gwi/aws-certs/GWI_rPi_Gateway.cert.pem';
const privateKeyPathName = '/home/gwi/aws-certs/GWI_rPi_Gateway.private.key';
const caCertPathName = '/home/gwi/aws-certs/root-CA.crt';

const clientId = 'your-device-id';
const endpoint = 'aau4h3wa11hq0-ats.iot.us-west-1.amazonaws.com';
const region = 'us-west-1';
const topic = 'lutron-messages';

const fs = require('fs');
const path = require('path');
const AWSIoT = require('aws-iot-device-sdk');
const Telnet = require('telnet-client');

const privateKeyPath = path.resolve(__dirname, privateKeyPathName);
const certPath = path.resolve(__dirname, certPathName);
const caCertPath = path.resolve(__dirname, caCertPathName);
// const privateKey = fs.readFileSync(privateKeyPath);
// const cert = fs.readFileSync(certPath);
// const caCert = fs.readFileSync(caCertPath);

const iotDevice = AWSIoT.device({
    keyPath: privateKeyPath,
    certPath: certPath,
    caPath: caCertPath,
    clientId: clientId,
    host: endpoint,
    region: region
});

const options = {
    debug: true,
    host: ipAddress,
    port: port,
    negotiationMandatory: true,
    timeout: 0,
    loginPrompt: 'login: ',
    passwordPrompt: 'password: ',
    username: login + '\r',
    password: password + '\r',
    shellPrompt: 'QNET>'
};

const client = new Telnet();
console.log('Connecting with ip address: ' + ipAddress + ' and port: ' + port + ' and login: ' + login);

client.connect(options).catch((err) => {
    console.log('failed to connect with error:', err);
});

client.on('failedlogin', function() {
    console.log('failed login');
});

client.on('connect', function() {
    console.log('trying to log in');
});

client.on('ready', function() {
    console.log('ready, trying to receive messages from IoT Core!!!');

    iotDevice.on('connect', function() {
        console.log('connected to AWS IoT Core');
        iotDevice.subscribe(topic);
    });

    iotDevice.on('message', function(topic, message) {
        console.log(`Received message from topic ${topic}: ${message.toString()}`);
        // client.send(message.toString() + '\r', (error, data) => {
        //     if (error) {
        //         return console.log('error sending a command:', error);
        //     }
        //
        //     console.log('got response from the server:', data);
        // });
    });
});
//
