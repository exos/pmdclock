"use strict";

const fs = require("fs");
const path = require("path");
const Storage = require("node-storage");
const Session = require("./session");
const config = require("./config");

const DB_PATH = path.normalize(config.get("db"));

var instance = null;

class History {

    constructor() {
        History.checkDataDir();
        this._storage = new Storage(DB_PATH);
        this._data = null;
        this._ctomatos = null;
        this._load();
    }

    _load() {
        debugger;
        var data = this._storage.get("tomatos");
        var tallr = this._storage.get("cons_tomatos");

        this._data = data;
        this._ctomatos = tallr;

        if (!data) {
            this._data = [];
        }

        if (!tallr) {
            this._ctomatos = 0;
        }
    }

    sync() {
        this._storage.put("tomatos", this._data);
        this._storage.put("cons_tomatos", this._ctomatos);
    }

    remove(session, sync = true) {
        this._data = this._data.filter(x => x._id !== session.id);
        if (sync) {
            this.sync();
        }
    }

    save(session, sync = true) {

        var localSession = this._data.find(x => x._id === session._id);

        if (localSession) {
            this.remove(localSession, false);
        }

        this._data.push(session.toJSON());

        if (session._type === Session.types.TYPE_TASK) {
            this._ctomatos++;
        }

        if (session._type === Session.types.TYPE_LARGE_REST) {
            this._ctomatos = 0;
        }

        if (sync) {
            this.sync();
        }
    
    }

    list() {
        return this._data;
    }

    getContinuesTomatos() {
        return this._ctomatos;
    }

    clear(sync = true) {
        this._data = [];
        this._ctomatos = 0;
        if (sync) {
            this.sync();
        }
    }

    each(cb) {
        return this._data.forEach(cb);
    }

    sort(cb) {
        return this._data.sort(cb);
    }

    map(cb) {
        return this._data.map(cb);
    }

    static createDataDir(dirname) {
        fs.mkdirSync(dirname, 0o700);
    }

    static checkDataDir() {
        var stats, directory = path.dirname(DB_PATH);

        try {
            stats = fs.lstatSync(directory);
        } catch (e) {
            return History.createDataDir(directory);
        }

        if (!stats.isDirectory(directory)) {
            throw new Error(`${directory} is not a directory`);
        }

    }

    static getInstance() {
        if (!instance) {
            instance = new History();
        }

        return instance;
    }

}

module.exports = History;
