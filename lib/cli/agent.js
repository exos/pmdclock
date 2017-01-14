"use strict";

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

    if (args.kill) {
        return killServer();
    }

    process.stdout.write(`Starting agent\n`); 

    try {
        PMDServer.chekIfRunning();
    } catch (e) {
        process.stderr.write(`${e}\n`);
        process.exit(3);
    }

    if (config.get("daemon") && !args.foreground) {
        daemonize();
    }

    process.title = "pmdclock-agent";

    const server = new PMDServer();
    
    const exit = function (code) {
        setTimeout(() => {
            process.exit(code);
        }, 500);
        server.stop();
    };

    process.on("SIGINT", () => exit(128));
    process.on("SIGTERM", () => exit(128));

    server.addCmd("close", () => {
        setTimeout(() => {
            exit(0);
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

    server.addCmd("start", (name, cmode = true) => {

        var actual = Session.thereAreActual();

        if (actual && cmode && (actual._type === Session.types.TYPE_REST ||
                         actual._type === Session.types.TYPE_LARGE_REST)) {
            actual.finish(); 
            History.getInstance().save(actual);
        }

        var session = Session.start(name);
        
        return {
            back: actual && actual.toJSON(),
            actual: session.toJSON(),
        };

    });

    server.addCmd("finish", () => {
        var session = Session.finish();
        History.getInstance().save(session);
        return session.toJSON();
    });

    server.addCmd("cancel", () => {
        var session = Session.cancel();
        return session.toJSON();
    });

    server.addCmd("rest", (type, cmode = true, forceShort = false) => {
        var session;

        var history = History.getInstance();

        var actual = Session.thereAreActual();
        var autoLargeRest = parseInt(config.get("autoLargeRest"));

        
        if (actual && cmode && actual._type === Session.types.TYPE_TASK) {
            actual.finish(); 
            History.getInstance().save(actual);
        }

        var cTomatos = history.getContinuesTomatos();

        console.log(autoLargeRest, cTomatos, forceShort );

        if (autoLargeRest && cTomatos >= autoLargeRest && !forceShort) {
            type = Session.types.TYPE_LARGE_REST; 
        }

        if (type === Session.types.TYPE_REST) {
            session = Session.rest();
        } else {
            session = Session.largeRest();
        }
        
        return {
            back: actual && actual.toJSON(),
            actual: session.toJSON(),
            large: type === Session.types.TYPE_LARGE_REST
        };

    });

    server.addCmd("list", () => {
        var list = History.getInstance().list();
        return list;
    });

    server.addCmd("clear", () => {
        var history = History.getInstance();
        var cant = history.list().length;
        history.clear();
        return cant;
    });


    server.serve();

};
