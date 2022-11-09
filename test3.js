const Telnet = require('telnet-client')
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8082 });

const midi = require('midi');



// Set up a new input.
const input = new midi.Input();

// Count the available input ports.
input.getPortCount();

// Get the name of a specified input port.
console.log("midi port: ", input.getPortName(3));

// Open the first available input port.
input.openPort(3);
var old;
input.on('message', (deltaTime, midimessage) => {
    var cmd;
    
    if (midimessage[0] == 148 && midimessage[2] != 0 ) {

        console.log(midimessage[2]); //For testing
        if (midimessage[1] < 9) {
            cmd = ((midimessage[1] + 1) % 12) + 12;
        } else {
            cmd = midimessage[1] + 1;
        }

        

        
        cmd = '#DEVICE,35,'+cmd.toString()+',3';
        console.log(old, cmd)

            // const cmd = '#DEVICE,96,1,3'
        if (cmd!=old){
            client.send(cmd + '\r', (error, data) => {
            if (error) {
                return console.log('error sending a command:', error)
            }

            console.log('got response from the server:', data)
        });

        }
        old = cmd;
        console.log(old);
        
        


    }
});

wss.on("connection", ws => {
    console.log("Wave of Wellness Device Connected");

    

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