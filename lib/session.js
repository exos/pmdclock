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

const TYPE_TASK = 0x10;
const TYPE_REST = 0x20;
const TYPE_LARGE_REST = 0x30;

class PomodoroSession extends events.EventEmitter {

    constructor(name = "Pomodoro task", type = TYPE_TASK) {
        super();
        this._id = uuid.v4();
        this._active = true;
        this._name = name;
        this._start = new Date();
        this._finish = null;
        this._status = STATUS_RUNNING;
        this._notificator = null;
        this._type = type; 

        switch (this._type) {
            case TYPE_TASK:
                this._time = parseInt(config.get("taskTime")) * 60000;
                break;
            case TYPE_REST:
                this._time = parseInt(config.get("restTime")) * 60000;
                break;
            case TYPE_LARGE_REST:
                this._time = parseInt(config.get("lasrgeRestTime")) * 60000;
                break;
            default:
                throw new Error("Invalid type of session");
        }

        this._expire = new Date(this._start.getTime() + this._time);

        this._timer = setTimeout(() => {
            this._status = STATUS_LATE;
            this._notificator = new notifier.LateNotificator(this);
            this.emit("timeover", this);
        }, this._time);

    }

    toJSON() {
        return {
            _id: this._id,
            _type: this._type,
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

    static rest() {
        if (PomodoroSession.thereAreActual()) {
            throw new Error("There are an actual task");
        }

        instance = new PomodoroSession("Rest", TYPE_REST);

        return instance;
    }

    static largeRest() {
        if (PomodoroSession.thereAreActual()) {
            throw new Error("There are an actual task");
        }

        instance = new PomodoroSession("Large rest", TYPE_LARGE_REST);

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

        return instance;
    }
    
}

PomodoroSession.status = { 
    STATUS_LATE,
    STATUS_PAUCED,
    STATUS_RUNNING,
    STATUS_FINISHED
};

PomodoroSession.types = {
    TYPE_TASK,
    TYPE_REST,
    TYPE_LARGE_REST
};

module.exports = PomodoroSession;
