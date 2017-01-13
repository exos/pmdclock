"use strict";

const program = require("commander");
const PMDClient = require("../client");

module.exports = function (args) {

    program
        .description("Delete history of tasks")
        .parse(args); 

    var client = new PMDClient();

    client.on("connect", () => {
        client.cmd("clear")
            .then((cant) => {
                process.stdout.write(`History clear, ${cant} tasks deleted.\n`);
                process.exit(0);
            })
            .catch((e) => {
                process.stderr.write(`${e}\n`);
                process.exit(1);
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
