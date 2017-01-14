"use strict";

const PMDClient = require("../client");
const config = require("../config");

module.exports = function (args) {

    var client = new PMDClient();

    var cmode = config.get("continueMode");

    client.on("connect", () => {
        client.cmd("start", args.taskname || "Pomodoro task", cmode)
            .then((response) => {

                if (response.back) {
                    process.stdout.write(`Rest finished!\n`);
                }

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
