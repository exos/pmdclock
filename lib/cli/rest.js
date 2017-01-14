"use strict";

const program = require("commander");
const PMDClient = require("../client");
const Session = require("../session");
const config = require("../config");

const largeRestTime = parseInt(config.get("largeRestTime"));
const cmode = !!config.get("continueMode");

module.exports = function (args) {

    program
        .description("Start rest")
        .option("-l, --large", `Large rest (${largeRestTime}) minutes`)
        .option("--short", `Force short rest, don't apply the autoLongRest`)
        .parse(args); 

    var client = new PMDClient();

    client.on("connect", () => {
        var type;

        if (program.large) {
            type = Session.types.TYPE_LARGE_REST;
        } else {
            type = Session.types.TYPE_REST;
        }

        client.cmd("rest", type, cmode, !!program.short)
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
