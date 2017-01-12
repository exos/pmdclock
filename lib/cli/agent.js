"use strict";

const program = require("commander");
const daemonize = require("daemon");
const config = require("../config");
const PMDServer = require("../server");

module.exports = function (args) {

    program
        .option("-f, --foreground", "Start in foreground")
        .description("Start the agent")
        .parse(args); 

    process.stdout.write(`Starting agent\n`); 

    if (config.get("daemon") && !program.foreground) {
        daemonize();
    }

    const server = new PMDServer();

    server.addCmd("close", () => {
        process.exit(0);
    });

    server.serve();

};
