"use strict";

const program = require("commander");
const PMDClient = require("../client");

module.exports = function (args) {

    program
        .description("Start new task!")
        .option("-n, --taskname <name>", "Name of task", String)
        .parse(args); 

    var client = new PMDClient();

    client.on("connect", () => {
        client.cmd("start", program.taskname || "Pomodoro task")
            .then(() => {
                process.stdout.write(`Task started!\n`);
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
