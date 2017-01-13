"use strict";

const program = require("commander");
const packageInfo = require("../../package.json");

process.on("uncaughtException", (err) => {
    process.stderr.write(`${err}\n`); 
    process.exit(12);
});

const agent = require("./agent"); 
const info = require("./info");
const start = require("./start");
const finish = require("./finish");
const cancel = require("./cancel");
const rest = require("./rest");
const list = require("./list");
const clear = require("./clear");

const mainCLI = function (args) {

    program
        .version(packageInfo.version)
        .command("agent", "Start the agent").alias("a")
        .command("info", "Get current task info").alias("i")
        .command("start [name]", "Start new pomodoro task").alias("s")
        .command("finish", "Finish the current pomodoro task").alias("f")
        .command("cancel", "Cancel current task")
        .command("rest", "Take a rest").alias("r")
        .command("list", "List finished tasks").alias("l")
        .command("clear", "Clear history")
        .parse(args)
    ;
};

module.exports.mainCLI = mainCLI;
module.exports.agent = agent;
module.exports.info = info;
module.exports.start = start;
module.exports.finish = finish;
module.exports.rest = rest;
module.exports.list = list;
module.exports.clear = clear;
module.exports.cancel = cancel;
