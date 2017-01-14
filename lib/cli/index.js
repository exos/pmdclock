"use strict";

const program = require("commander");
const packageInfo = require("../../package.json");

const config = require("../config");
const largeRestTime = parseInt(config.get("largeRestTime"));

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


program
    .version(packageInfo.version)
    .description(packageInfo.description);

program
    .command("agent")
    .alias("a")
    .description("Start the agent")
    .option("-f, --foreground", "Start in foreground")
    .option("-k, --kill", "Kill current agent")
    .action(agent);

program
    .command("info")
    .alias("i")
    .description("Get current task info")
    .option("--format <format>", "Format of output", String)
    .action(info);

program
    .command("start")
    .alias("s")
    .description("Start new task!")
    .option("-n, --taskname <name>", "Name of task", String)
    .action(start);

program
    .command("finish")
    .alias("f")
    .description("Finish the current pomodoro task")
    .action(finish);
    
program 
    .command("cancel")
    .description("Cancel the current task")
    .action(cancel);

program
    .command("rest")
    .alias("r")
    .description("Take a rest")
    .option("-l, --large", `Large rest (${largeRestTime}) minutes`)
    .option("--short", `Force short rest, don't apply the autoLongRest`);
    
program
    .command("list")
    .alias("l")
    .description("List finished tasks")
    .action(list);

program
    .command("clear")
    .description("Delete history of tasks")
    .action(clear);

program
    .command("help")
    .description("Show help")
    .action(() => {
        program.help();
    });

program
    .command('*')
    .action(() => {
        process.stderr.write(`The command ${program.args[0]}, is not a valid ` +
                             `pmdclock command, see ${program._name} --help`);
        process.exit(1);
    });

const mainCLI = function (args) {
    program.parse(args);

    if (!program.args.length) {
        program.help();
    }

};

module.exports = {
    mainCLI,
    agent,
    info,
    start,
    finish,
    rest,
    list,
    clear,
    cancel,
};
