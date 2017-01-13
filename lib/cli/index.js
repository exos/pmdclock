"use strict";

const program = require("commander");
const Table = require("cli-table");
const moment = require("moment");
const packageInfo = require("../../package.json");

const agent = require("./agent"); 
const info = require("./info");
const start = require("./start");
const finish = require("./finish");

const mainCLI = function (args) {

    program
        .version(packageInfo.version)
        .command("agent", "Start the agent").alias("a")
        .command("info", "Get current task info").alias("i")
        .command("start [name]", "Start new pomodoro task").alias("s")
        .command("finish", "Finish the current pomodoro task").alias("f")
        .parse(args)
    ;
};

const generateCliTable = function (history) {

    var sorted = history.sort(x => x.start);

    var table = new Table({
        head: ["Name", "Started", "Finished", "On time"],
        chars: {
            'mid': '',
            'left-mid': '',
            'mid-mid': '',
            'right-mid': ''
        }
    });

    table.push(sorted.map((r) => {
        var fStart = moment(r.start).format();
        var fFinish = moment(r.finish).format();
        var diffMs = r.finish - r.expire;
        var delta = Math.round(
            ((diffMs % 86400000) % 3600000) / 60000); // minutes
        return [r.name, fStart, fFinish, `${delta} mins`]; 
    }));

    return table;

};

module.exports.mainCLI = mainCLI;
module.exports.generateCliTable = generateCliTable;
module.exports.agent = agent;
module.exports.info = info;
module.exports.start = start;
module.exports.finish = finish;
