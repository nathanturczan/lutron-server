const Telnet = require('telnet-client')
const WebSocket = require("ws");

const wss = new WebSocket.Server({port: 8082});

wss.on("connection", ws => {
    console.log("Wave of Wellness Device Connected");

    ws.on("close", () => {
        console.log("Client has disconnected");
    });


      //logic here to run the telnet send command right here 
      const cmd = '#DEVICE,96,1,3'

    client.send(cmd + '\r', (error, data) => {
        if (error) {
            return console.log('error sending a command:', error)
        }

        console.log('got response from the server:', data)
    })

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

client.on('failedlogin', function () {
  console.log('failed login')
})

client.on('connect', function () {
  console.log('trying to log in')
})



client.on('ready', function () {
  console.log('ready, trying to send a command!!!')
  
})