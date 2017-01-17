"use strict";

const Table = require("cli-table");
const moment = require("moment");
const PMDClient = require("../client");
const Session = require("../session");
const config = require("../config");

const taskIcon = config.get("taskIcon");
const taskRunningIcon = config.get("taskRunningIcon");
const restIcon = config.get("restIcon");
const restRunningIcon = config.get("restRunningIcon");
const largeRestIcon = config.get("largeRestIcon");
const largeRestRunningIcon = config.get("largeRestRunningIcon");
const reverseSort = config.get("reverseSort");
const defaultListHead = config.get("defaultListHead");
const defaultListTail = config.get("defaultListTail");

const historySorter = function (options) {
    var {reverse} = options || false;
    
    return function (a, b) {
        if (reverse) {
            return (a.started < b.started) ? 1 : -1;
        } else {
            return (a.started > b.started) ? 1 : -1;
        }
    };
};

const generateActualReg = function (actual) {
    var icon, now = (new Date()).getTime();
    var fStart = moment(actual.started).calendar();
    var diffMs = now - actual.expire;
    var delta = Math.round(
        ((diffMs % 86400000) % 3600000) / 60000); // minutes

    switch (actual._type) {
        case Session.types.TYPE_TASK:
            icon = taskRunningIcon;
            break;
        case Session.types.TYPE_REST:
            icon = restRunningIcon;
            break;
        case Session.types.TYPE_LARGE_REST:
            icon = largeRestRunningIcon;
            break;
        default:
            icon = "?";
    }

    return [icon, actual.name, fStart, "...", `${delta} mins`]; 

};

const generateCliTable = function (history, actual) {

    var table = new Table({
        head: ["", "Name", "Started", "Finished", "On time"],
        chars: {
            'mid': '',
            'left-mid': '',
            'mid-mid': '',
            'right-mid': ''
        }
    });

    var data = history.map((r) => {
        var icon;
        var fStart = moment(r.started).calendar();
        var fFinish = moment(r.finish).calendar();
        var diffMs = r.finish - r.expire;
        var delta = Math.round(
            ((diffMs % 86400000) % 3600000) / 60000); // minutes

        switch (r._type) {
            case Session.types.TYPE_TASK:
                icon = taskIcon;
                break;
            case Session.types.TYPE_REST:
                icon = restIcon;
                break;
            case Session.types.TYPE_LARGE_REST:
                icon = largeRestIcon;
                break;
            default:
                icon = "?";
        }

        return [icon, r.name, fStart, fFinish, `${delta} mins`]; 
    });

    table.push(...data);

    if (actual) {
        table.push(generateActualReg(actual));
    }

    return table;

};

module.exports = function (args) {

    var client = new PMDClient();
    
    if (typeof args.head === "undefined") {
        args.head = defaultListHead;
    }

    if (typeof args.tail === "undefined") {
        args.tail = defaultListTail;
    }

    client.on("connect", () => {
        client.cmd("list")
            .then((result) => {
                var {list, actual} = result;

                if (!list.length && !actual) {
                    process.stdout.write(`Not tasks finished\n`);
                    process.exit(0);
                }

                var sorted = list.sort(historySorter({
                    reverse: reverseSort ? !args.reverse : !!args.reverse
                }));

                if (args.head) {
                    sorted = sorted.slice(0, args.head);
                }

                if (args.tail) {
                    sorted = sorted.slice(-args.tail);
                }

                var table = generateCliTable(sorted, actual);
                process.stdout.write(table.toString());
                process.stdout.write(`\n`);
                process.exit(0);
            })
            .catch((e) => {
                process.stderr.write(`${e}\n`);
                process.exit(1);
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
