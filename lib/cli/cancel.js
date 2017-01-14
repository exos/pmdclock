"use strict";

const PMDClient = require("../client");

module.exports = function () {

    var client = new PMDClient();

    client.on("connect", () => {
        client.cmd("cancel")
            .then((info) => {
                var now = (new Date()).getTime();
                var {started} = info;
                var diffMs = now - started;
                var delta = Math.round(
                    ((diffMs % 86400000) % 3600000) / 60000); // minutes

                process.stdout.write(`Task cancelled at ${delta} minutes\n`);
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
