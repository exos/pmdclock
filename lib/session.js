"use strict";

const events = require("events");
const config = require("./config");

var instance = null;

const STATUS_RUNNING = 0x00;
const STATUS_PAUCED = 0x10;
const STATUS_FINISHED = 0x20;
const STATUS_LATE = 0x30;


class PomodoroSession extends events.EventEmitter {

    constructor(name = "Standar pomodoro task") {
        super();
        this._active = true;
        this._name = name;
        this._start = new Date();
        this._finish = null;
        this._time = parseInt(config.get("taskTime"));
        this._status = STATUS_RUNNING;
        this._timer = setTimeout(() => {
            this._status = STATUS_LATE;
            this.emit("timeover", this);
        }, this._time * 60000);
    }

    toJSON() {
        return {
            name: this._name,
            active: this._active,
            started: this._start.getTime(),
            finish: this._finish,
            status: this._status
        };
    }

    cancel() {
        clearTimeout(this._timer);
        this._active = false;
    }

    finish() {
        clearTimeout(this._timer);
        this._status = STATUS_FINISHED;
        this._finish = new Date();
        this._active = false;
        this.emit("finish", this.toJSON());
    }

    get STATUS_RUNNING() { return STATUS_RUNNING; }
    get STATUS_PAUCED() { return STATUS_PAUCED; }
    get STATUS_LATE() { return STATUS_LATE; }
    get STATUS_FINISHED() { return STATUS_FINISHED; }

    static thereAreActual () {
        if (instance && instance._active) {
            return instance;
        } else {
            return false;
        }
    }

    static start(name) {
        debugger;
        if (PomodoroSession.thereAreActual()) {
            throw new Error("There are an actual task");
        }

        instance = new PomodoroSession(name);

        return instance.toJSON();
    }

    static cancel() {
        if (PomodoroSession.thereAreActual()) {
            instance.cancel();
        } else {
            throw new Error("There are not task to cancel");
        }
    }
    
}

PomodoroSession.status = { 
    STATUS_LATE,
    STATUS_PAUCED,
    STATUS_RUNNING,
    STATUS_FINISHED
};

module.exports = PomodoroSession;
