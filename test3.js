const Telnet = require('telnet-client')
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8082 });

const midi = require('midi');



// Set up a new input.
const input = new midi.Input();

// Count the available input ports.
input.getPortCount();

// Get the name of a specified input port.
console.log("midi port: ", input.getPortName(1));

// Configure a callback.
input.on('message', (deltaTime, midimessage) => {
    // The message is an array of numbers corresponding to the MIDI bytes:
    //   [status, data1, data2]
    // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
    // information interpreting the messages.
    //console.log(`m: ${message} d: ${deltaTime}`);
    if (midimessage[0] == 148) {
        if (midimessage[1] < 9) {
            console.log((((midimessage[1] + 1) % 12) + 12));
        } else {
            console.log((midimessage[1] + 1));
        }

    }

});

// Open the first available input port.
input.openPort(1);


wss.on("connection", ws => {
    console.log("Wave of Wellness Device Connected");


    if (midimessage[0] == 148) {
        if (midimessage[1] < 9) {
            const cmd = ((midimessage[1] + 1) % 12) + 12;

        } else {
            const cmd = midimessage[1] + 1;
        }

        ws.on("message", (data) => {
            console.log("received Message"); //For testing
            cmd = "#DEVICE,35,"+cmd.toString()+",3";
            console.log("stringified: ", cmd)

            // const cmd = '#DEVICE,96,1,3'

            client.send(cmd + '\r', (error, data) => {
                if (error) {
                    return console.log('error sending a command:', error)
                }

                console.log('got response from the server:', data)
            });

        });

    }

    //This is all being run once the device connects
    //We run the command once, and then that's it
    //We want to create a message that is passed in as a parameter
    //logic here to run the telnet send command right here

    ws.on("message", (data) => {
        console.log("received Message"); //For testing
        const cmd = data.toString();
        console.log(cmd); //For testing

        // const cmd = '#DEVICE,96,1,3'

        client.send(cmd + '\r', (error, data) => {
            if (error) {
                return console.log('error sending a command:', error)
            }

            console.log('got response from the server:', data)
        });

    });

    ws.on("close", () => {
        console.log("Client has disconnected");
    });

});



const ipAddress = '192.168.15.90'
const port = 23
const login = 'Wellness'
const password = 'FutureCare@dm'

client = new Telnet()

console.log('Connecting with ip address: ' + ipAddress + ' and port: ' + port + ' and login: ' + login)

var options = {
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
}

client.connect(options).catch((err) => {
    console.log('failed to connect with error:', err)
})

client.on('failedlogin', function() {
    console.log('failed login')
})

client.on('connect', function() {
    console.log('trying to log in')
})



client.on('ready', function() {
    console.log('ready, trying to send a command!!!')

})