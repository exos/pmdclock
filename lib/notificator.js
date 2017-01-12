"use strict";

var libnotify = require('libnotify');
var moment = require("moment");
var config = require("./config");

class LateNotificator {

    constructor(session) {
        this._session = session;

        this._interval = setInterval(() => {
            this.notify();
        }, parseInt(config.get("notifyEach")) * 1000);

        this.notify();
    }

    notify() {
  
        var name = this._session._name;
        var delta = moment(this._session._expire).fromNow();
        var msg = `${name} finish about ${delta}`;

        libnotify.notify(msg, {
            title: 'Pomodoro Clock',
            time: 1200000
        });
    }

    cancel() {
        clearInterval(this._interval);
    }

}

module.exports.LateNotificator = LateNotificator;
