"use strict";

const fs = require("fs");
const events = require("events");
const ipc = require("node-ipc");
const config = require("./config");

class PMDServer extends events.EventEmitter {

    constructor() {
        super();
        this._ipc = new ipc.IPC();
        this._ipc.config.silent = true;
        this._ipc.config.id = "pmdclock";
        this._clients = [];
        this._commands = [];
    }

    _resolveCmd(data) {
        var  {id, socket, error, result} = data;

        if (error && typeof error !== "string") {
            error = error.message || error.toString();
        }

        var res = {
            id,
            error,
            result: JSON.stringify(result)
        };

        this._ipc.server.emit(socket, "response", res);

    }
    
    _executeCmd(data) {
        var result, {id, cmd, args, socket} = data;
        var command = this._commands.find(x => x.cmd === cmd);

        if (!command) {
            return this._resolveCmd({
                id,
                socket,
                error: "Command not found",
                response: null
            });
        }

        try {
            result = command.cb.apply(command.cb.bind(), args);
        } catch (e) {
            return this._resolveCmd({
                id,
                socket,
                error: e,
                response: null
            });
        }

        Promise.resolve(result)
            .then((response) => {
                return this._resolveCmd({
                    id,
                    socket,
                    error: null,
                    result: response
                });
            })
            .catch((e) => {
                return this._resolveCmd({
                    id,
                    socket,
                    error: e,
                    result: null
                });
            });

    }

    serve() {

        PMDServer.chekIfRunning();

        this._ipc.serve(config.get('socket'), () => {

            this._ipc.server.on("error", (err) => {
                this._error(err);            
            });

            this._ipc.server.on("connect", (socket) => {
                this._clients.push(socket);
                this.emit("connect", socket);
                this._ipc.server.emit(socket, "message", "hola");
            });

            this._ipc.server.on("disconnect", () => {
                this.emit("disconnect");
            });

            this._ipc.server.on("socket.disconnected", (socket) => {
                this._clients = this._clients.filter(x => x !== socket);
                this.emit("disconnected", socket);
            });

            this._ipc.server.on("cmd", (data, socket) => {
                data.socket = socket;
                this._executeCmd(data);
            });

        });

        this._ipc.server.start();
    }

    stop() {
        this._ipc.server.stop();
    }

    addCmd(cmd, cb) {
        this._commands.push({
            cmd,
            cb
        });
    }

    static chekIfRunning() {
        var sockStatus;

        try {
            sockStatus = fs.lstatSync(config.get('socket'));
        } catch (e) {
            return false;
        }

        if (sockStatus) {
            throw new Error("Already running");
        } 

    }

}

module.exports = PMDServer;
