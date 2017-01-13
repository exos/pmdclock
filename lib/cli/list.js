"use strict";

const program = require("commander");
const Table = require("cli-table");
const moment = require("moment");
const PMDClient = require("../client");

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

    var data = sorted.map((r) => {
        var fStart = moment(r.started).calendar();
        var fFinish = moment(r.finish).calendar();
        var diffMs = r.finish - r.expire;
        var delta = Math.round(
            ((diffMs % 86400000) % 3600000) / 60000); // minutes
        return [r.name, fStart, fFinish, `${delta} mins`]; 
    });

    table.push(...data);

    return table;

};

module.exports = function (args) {

    program
        .description("List finish tasks")
        .parse(args); 

    var client = new PMDClient();

    client.on("connect", () => {
        client.cmd("list")
            .then((list) => {

                if (!list.length) {
                    process.stdout.write(`Not tasks finished\n`);
                    process.exit(0);
                }

                var table = generateCliTable(list);
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
