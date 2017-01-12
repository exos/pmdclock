"use strict";

const program = require("commander");
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

module.exports.mainCLI = mainCLI;
module.exports.agent = agent;
module.exports.info = info;
module.exports.start = start;
module.exports.finish = finish;
