"use strict";

const os = require("os");
const etc = require("etc");
const yml = require('etc-yaml');

const user = os.userInfo();

const homedir = user.homedir;
const confpath = `${homedir}/.pmdclock/config.yml`;

module.exports = etc()
    .use(yml)
    .file(confpath)
    .add({
        socket: `/run/user/${user.uid}/pmdclock.socket`,
        db: `${homedir}/.pmdclock/db.dat`,
        daemon: true,
        taskTime: 25,
        restTime: 5,
        largeRestTime: 20,
        autoLargeRest: 4,
        showNotifications: true,
        runCmd: null,
        autoStopCmd: false,
        notifyEach: 30,
        infoFormat: "%n finish in %R",
        continueMode: true,
        taskIcon: "[]",
        taskRunningIcon: "[>]",
        restIcon: "o/",
        restRunningIcon: ":)",
        largeRestIcon: "...",
        largeRestRunningIcon: ":D"
    });
