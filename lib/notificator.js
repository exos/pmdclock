"use strict";

const exec = require('child_process').exec;
const libnotify = require('libnotify');
const moment = require("moment");
const config = require("./config");

const cmd = config.get("runCmd");
var stopCmd = config.get("autoStopCmd");

const SIGNALS = [
    "SIGHUP",
    "SIGINT",
    "SIGQUIT",
    "SIGKILL",
    "SIGTERM",
    "SIGUSR1",
    "SIGUSR2",
    "SIGCHLD",
    "SIGSTOP",
    "SIGTSTP"
];


if (typeof stopCmd === "string") {

    stopCmd = stopCmd.toUpperCase();

    if (SIGNALS.indexOf(stopCmd) === -1) {
        throw new Error(`Invalid signal ${stopCmd}, check the configuration`);
    }
} else {
    stopCmd = !!stopCmd ? "SIGTERM" : false;
}

class LateNotificator {

    constructor(session) {
        this._session = session;
        this._cmdChild = null;

        this._interval = setInterval(() => {
            this.notify();
        }, parseInt(config.get("notifyEach")) * 1000);

        this.notify();

        if (cmd) {
            this._cmdChild = exec(cmd);
        }

    }

    notify() {

        if (config.get("showNotifications")) {
  
            var name = this._session._name;
            var delta = moment(this._session._expire).fromNow();
            var msg = `${name} finish about ${delta}`;

            libnotify.notify(msg, {
                title: 'Pomodoro Clock',
                time: 1200000
            });

        }

    }

    cancel() {
        clearInterval(this._interval);

        if (stopCmd) {
            try {
                this._cmdChild.kill(stopCmd);
            } catch (e) {
                console.error(e); 
            }
        }

        this._cmdChild = null;
    }

}

module.exports.LateNotificator = LateNotificator;
