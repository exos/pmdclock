"use strict";

const os = require("os");
const etc = require("etc");

const user = os.userInfo();

const homedir = user.homedir;

module.exports = etc()
    .add({
        socket: `/run/user/${user.uid}/pmdclock.socket`,
        db: `${homedir}/.pmdclock/db.dat`,
        daemon: true,
        taskTime: 25,
        restTime: 5,
        largeRestTime: 20,
        showNotifications: true,
        notifyEach: 30,
        infoFormat: "%n finish in %R",
        continueMode: true
    });
