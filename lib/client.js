"use strict";

const events = require("events");
const ipc = require("node-ipc");
const uuidV4 = require('uuid/v4');
var Promise = require("bluebird");
const config = require("./config");

class PMDClient extends events.EventEmitter {

    constructor() {
        super();
        this._id = uuidV4();
        this._ipc = new ipc.IPC();
        this._ipc.config.silent = true;
        this._ipc.config.retry = 500;
        this._ipc.config.maxRetries = 10;
    }

    _error(err) {
        this.emit("error", err);
    }

    connect() {

        this._ipc.connectTo(this._id, config.get('socket'), () => {
            
            this._ipc.of[this._id].on("connect", () => {
                this.emit("connect");
            });

            this._ipc.of[this._id].on("disconnect", () => {
                this.emit("disconnect");
            });

            this._ipc.of[this._id].on("message", (message) => {
                this.emit("message", message);
            });

            this._ipc.of[this._id].on("response", (data) => {
                var error = null, {result} = data;

                if (data.error) {
                    error = new Error(data.error);
                }

                this.emit(`response:${data.id}`, {error, result});
            });

            this._ipc.of[this._id].on("error", (err) => {
                this._error(err);
            });

        });

    }

    stop() {
        this._ipc.server.stop();
    }

    cmd(...args) {
        var cmd = args.shift();
        var cid = uuidV4();

        return new Promise((resolve, reject) => {

            this._ipc.of[this._id].emit("cmd", {
                id: cid,
                cmd,
                args
            });

            this.on(`response:${cid}`, (data) => {

                if (data.error) {
                    return reject(data.error);
                }

                return resolve(JSON.parse(data.result));

            });

        });
    }

}

module.exports = PMDClient;
