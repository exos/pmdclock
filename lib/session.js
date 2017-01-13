"use strict";

const events = require("events");
const uuid = require("uuid");
const config = require("./config");
const notifier = require("./notificator");

var instance = null;

const STATUS_RUNNING = 0x00;
const STATUS_PAUCED = 0x10;
const STATUS_FINISHED = 0x20;
const STATUS_LATE = 0x30;


class PomodoroSession extends events.EventEmitter {

    constructor(name = "Pomodoro task") {
        super();
        this._id = uuid.v4();
        this._active = true;
        this._name = name;
        this._start = new Date();
        this._finish = null;
        this._time = parseInt(config.get("taskTime")) * 60000;
        this._expire = new Date(this._start.getTime() + this._time);
        this._status = STATUS_RUNNING;
        this._notificator = null;
        this._timer = setTimeout(() => {
            this._status = STATUS_LATE;
            this._notificator = new notifier.LateNotificator(this);
            this.emit("timeover", this);
        }, this._time);
    }

    toJSON() {
        return {
            _id: this._id,
            name: this._name,
            active: this._active,
            started: this._start.getTime(),
            expire: this._expire.getTime(),
            finish: this._finish ? this._finish.getTime() : null,
            status: this._status
        };
    }

    cancel() {
        clearTimeout(this._timer);
        if (this._notificator) {
            this._notificator.cancel();
            this._notificator = null;
        }
        this._active = false;
    }

    finish() {
        clearTimeout(this._timer);
        this._status = STATUS_FINISHED;
        this._finish = new Date();
        this._active = false;
        if (this._notificator) {
            this._notificator.cancel();
            this._notificator = null;
        }
        this.emit("finish", this.toJSON());
        return this;
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
        if (PomodoroSession.thereAreActual()) {
            throw new Error("There are an actual task");
        }

        instance = new PomodoroSession(name);

        return instance;
    }

    static finish() {
        if (PomodoroSession.thereAreActual()) {
            instance.finish();
        } else {
            throw new Error("There are not task to finish");
        }

        return instance;
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
