"use strict";

const fs = require("fs");
const path = require("path");
const Storage = require("node-storage");
const config = require("./config");

const DB_PATH = path.normalize(config.get("db"));

var instance = null;

class History {

    constructor() {
        History.checkDataDir();
        this._storage = new Storage(DB_PATH);
        this._data = null;
        this._load();
    }

    _load() {
        var data = this._storage.get("tomatos");
        if (!data) {
            this._data = [];
            this.sync();
        }
        this._data = data;
    }

    sync() {
        this._storage.put("tomatos", this._data);
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

        if (sync) {
            this.sync();
        }
    
    }

    list() {
        return this._data;
    }

    clear(sync = true) {
        this._data = [];
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
