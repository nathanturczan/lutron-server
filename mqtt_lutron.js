// This script gets messages from IoT Core and relays them to lutron telnet.

const Telnet = require("telnet-client");
const iotsdk = require("aws-iot-device-sdk-v2");
const { exit } = require("process");
const mqtt_lutron = iotsdk.mqtt;
const TextDecoder = require("util").TextDecoder;
const common_args = require("../../util/cli_args");

const ipAddress = "192.168.15.90";
const port = 23;
const login = "Wellness";
const password = "FutureCare@dm";

const client = new Telnet();
console.log("Connecting with ip address: " + ipAddress + " and port: 23 and login: " + login);

var options = {
    debug: true,
    host: ipAddress,
    port: 23,
    negotiationMandatory: true,
    timeout: 0,
    loginPrompt: "login: ",
    passwordPrompt: "password: ",
    username: login + "\r",
    password: password + '\r',
    shellPrompt: "QNET>",
};

client.connect(options).catch((error) => {
    console.log("failed to connect with error:", error);
});

client.on("failedlogin", function () {
    console.log("failed login");
});

client.on("connect", function () {
    console.log("trying to log in");
});

client.on("ready", function () {
    console.log("ready, trying to send a command!!!");
});

async function execute_session(connection, argv) {
    return new Promise(async (resolve, reject) => {
        try {
            const decoder = new TextDecoder("utf8");

            const on_publish = async (topic, payload, dup, qos, retain) => {
                const json = decoder.decode(payload);
                console.log(`Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`);
                console.log(`Payload: ${json}`);
                try {
                    const payload = JSON.parse(json);
                    console.log(`Message: ${payload.message}`);
                    client.send(payload.message + "\r", (error, response) => {
                        if (error) {
                            return console.log("error sending a command:", error);
                        }
                        console.log("got response from the server:", response);
                    });
                } catch (error) {
                    console.log("Warning: Could not parse message as JSON...");
                }
            };

            await connection.subscribe(argv.topic, mqtt_lutron.QoS.AtLeastOnce, on_publish);

            // Keep the script running indefinitely
            while (true) {
                await new Promise((r) => setTimeout(r, 1000));
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function main() {
    const argv = {
        endpoint: "aau4h3wa11hq0-ats.iot.us-west-1.amazonaws.com",
        key: "/home/gwi/aws-iot/GWI_rPi_2.private.key",
        cert: "/home/gwi/aws-iot/GWI_rPi_2.cert.pem",
        ca_file: "/home/gwi/aws-iot/root-CA.crt",
        client_id: "sdk-nodejs-v2",
        topic: "lutron-messages",
        count: 10,
        verbosity: "info",
        will_message: undefined,
        use_websocket: false,
        signing_region: undefined,
        proxy_host: undefined,
        proxy_port: undefined,
    };

    common_args.apply_sample_arguments(argv);

    const iotConnection = common_args.build_connection_from_cli_args(argv);

    const timer = setInterval(() => {}, 90 * 1000);

    await iotConnection.connect().catch((error) => {
        console.log("Connect error: " + error);
        exit(-1);
    });
    await execute_session(iotConnection, argv).catch((error) => {
        console.log("Session error: " + error);
        exit(-1);
    });
    await iotConnection.disconnect().catch((error) => {
        console.log("Disconnect error: " + error);
        exit(-1);
    });
    // Allow node to die if the promise above resolved
        clearTimeout(timer);
}

main();

