"use strict";

const program = require("commander");
const PMDClient = require("../client");

module.exports = function (args) {

    program
        .description("Get current task info")
        .parse(args); 

    var client = new PMDClient();

    client.on("connect", () => {
        client.cmd("info")
            .then((info) => {
                if (!info) {
                    process.stdout.write(`Not tasks actually\n`);
                    process.exit(0);
                }
                console.log(info);
                process.exit(0);
            });
    });

    client.on("error", (e) => {
        process.stderr.write(`${e}\n`);
        process.exit(1);
    });

    try {
        client.connect();
    } catch (e) {
        process.stderr.write(`${e}\n`);
        process.exit(2);
    }

};
