"use strict";

const program = require("commander");
const packageInfo = require("../../package.json");

const agent = require("./agent"); 

const mainCLI = function (args) {

    program
        .version(packageInfo.version)
        .command("agent", "Start the agent").alias("a")
        .command("start [name]", "Start new pomodoro task").alias("s")
        .parse(args)
    ;
};

module.exports.mainCLI = mainCLI;
module.exports.agent = agent;
