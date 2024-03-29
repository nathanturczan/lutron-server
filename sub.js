// This script gets messages from IoT Core and prints them to console
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */

const iotsdk = require('aws-iot-device-sdk-v2');
const { exit } = require('process');
const mqtt = iotsdk.mqtt;
const TextDecoder = require('util').TextDecoder;
const common_args = require('../../util/cli_args');
const { Mutex } = require('async-mutex');

async function execute_session(connection, argv) {
    return new Promise(async (resolve, reject) => {
        try {
            const decoder = new TextDecoder('utf8');

            const on_publish = async (topic, payload, dup, qos, retain) => {
                const json = decoder.decode(payload);
                console.log(`Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`);
                console.log(`Payload: ${json}`);
                try {
                    const payload = JSON.parse(json);
                    console.log(`Message: ${payload.message}`);
                } catch (error) {
                    console.log("Warning: Could not parse message as JSON...");
                }
            };

            await connection.subscribe(argv.topic, mqtt.QoS.AtLeastOnce, on_publish);

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
        endpoint: 'aau4h3wa11hq0-ats.iot.us-west-1.amazonaws.com',
        key: '/home/gwi/aws-iot/GWI_rPi_2.private.key',
        cert: '/home/gwi/aws-iot/GWI_rPi_2.cert.pem',
        ca_file: '/home/gwi/aws-iot/root-CA.crt',
        client_id: 'sdk-nodejs-v2',
        topic: 'lutron-messages',
        count: 10, // You might want to set a default value for count as well
        verbosity: 'info',
        will_message: undefined, // Default value for will_message
        use_websocket: false, // Default value for use_websocket
        signing_region: undefined, // Default value for signing_region
        proxy_host: undefined, // Default value for proxy_host
        proxy_port: undefined, // Default value for proxy_port
    };

    common_args.apply_sample_arguments(argv);

    const connection = common_args.build_connection_from_cli_args(argv);

    // force node to wait 90 seconds before killing itself, promises do not keep node alive
    // ToDo: we can get rid of this but it requires a refactor of the native connection binding that includes
    //    pinning the libuv event loop while the connection is active or potentially active.
    const timer = setInterval(() => { }, 90 * 1000);

    await connection.connect().catch((error) => { console.log("Connect error: " + error); exit(-1) });
    await execute_session(connection, argv).catch((error) => { console.log("Session error: " + error); exit(-1) });
    await connection.disconnect().catch((error) => { console.log("Disconnect error: " + error), exit(-1) });

    // Allow node to die if the promise above resolved
    clearTimeout(timer);
}

main();

//