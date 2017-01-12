"use strict";

const program = require("commander");
const PMDClient = require("../client");

module.exports = function (args) {

    program
        .description("Finish the current")
        .parse(args); 

    var client = new PMDClient();

    client.on("connect", () => {
        client.cmd("finish")
            .then((info) => {
                console.log(info);
                var {finish, started} = info;
                var diffMs = finish - started;
                var delta = Math.round(
                    ((diffMs % 86400000) % 3600000) / 60000); // minutes

                process.stdout.write(`Task finished! in ${delta} minutes\n`);
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
