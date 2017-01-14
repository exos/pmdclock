"use strict";

const moment = require("moment");
const PMDClient = require("../client");
const Session = require("../session");
const config = require("../config");

module.exports = function (args) {

    var client = new PMDClient();

    const format = args.format || config.get("infoFormat");

    client.on("connect", () => {
        client.cmd("info")
            .then((info) => {
                var rmDelta, icon;

                if (!info) {
                    process.stdout.write(`Not tasks actually\n`);
                    process.exit(0);
                }

                var now = moment(new Date());
                var mTimeStart = moment(info.started);
                var mTimeExpire = moment(info.expire);
                var tDelta = moment(now.diff(mTimeStart));

                if (now < mTimeExpire) {
                   rmDelta = moment(mTimeExpire.diff(now))
                                                    .format("mm:ss");
                } else {
                    rmDelta = `-` + moment(now.diff(mTimeExpire))
                                                    .format("mm:ss");
                }

                var rfDelta = mTimeExpire.fromNow(true); 
                var rDelta = mTimeStart.fromNow(true); 

                if (info._type === Session.types.TYPE_TASK) {
                    icon = config.get("taskIcon");
                } else {
                    icon = config.get("restIcon");
                }

                var msg = format
                    .replace("%n", info.name)
                    .replace("%R", rfDelta)
                    .replace("%r", rmDelta)
                    .replace("%T", rDelta)
                    .replace("%t", tDelta.format("mm:ss"))
                    .replace("%i", icon)
                ;

                process.stdout.write(`${msg}\n`);
                process.exit(0);
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
