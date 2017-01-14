"use strict";

const PMDClient = require("../client");
const Session = require("../session");
const config = require("../config");

const cmode = !!config.get("continueMode");

module.exports = function (args) {

    var client = new PMDClient();

    client.on("connect", () => {
        var type;

        if (args.large) {
            type = Session.types.TYPE_LARGE_REST;
        } else {
            type = Session.types.TYPE_REST;
        }

        client.cmd("rest", type, cmode, !!args.short)
            .then((response) => {

                if (response.back) {
                    process.stdout.write(`Task finished!\n`);
                }

                if (response.large) {
                    process.stdout.write(`Large rest started!, be happy\n`);
                } else {
                    process.stdout.write(`Rest started!\n`);
                }

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
