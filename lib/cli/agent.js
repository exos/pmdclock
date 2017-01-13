"use strict";

const program = require("commander");
const daemonize = require("daemon");
const config = require("../config");
const PMDServer = require("../server");
const PMDClient = require("../client");
const Session = require("../session");
const History = require("../history");

const killServer = function () {
    var client = new PMDClient();

    client.on("connect", () => {
        client.cmd("close")
            .then(() => {
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

module.exports = function (args) {

    program
        .option("-f, --foreground", "Start in foreground")
        .option("-k, --kill", "Kill current agent")
        .description("Start the agent")
        .parse(args); 

    if (program.kill) {
        return killServer();
    }

    process.stdout.write(`Starting agent\n`); 

    try {
        PMDServer.chekIfRunning();
    } catch (e) {
        process.stderr.write(`${e}\n`);
        process.exit(3);
    }

    if (config.get("daemon") && !program.foreground) {
        daemonize();
    }

    const server = new PMDServer();

    server.addCmd("close", () => {
        setTimeout(() => {
            server.stop();
            process.exit(0);
        }, 500);

        return true;
    });

    server.addCmd("info", () => {
        var actual = Session.thereAreActual();

        if (!actual) {
            return null;
        } else {
            return actual.toJSON();
        }

    });

    server.addCmd("start", (name) => {
        var session = Session.start(name);
        return session.toJSON();
    });

    server.addCmd("finish", () => {
        var session = Session.finish();
        History.getInstance().save(session);
        return session.toJSON();
    });

    server.addCmd("cancel", () => {
        return Session.cancel();
    });

    server.addCmd("list", () => {
        var list = History.getInstance().list();
        console.log(list);
        return list;
    });

    server.serve();

};
