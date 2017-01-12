"use strict";

const os = require("os");
const etc = require("etc");

const user = os.userInfo();

module.exports = etc()
    .add({
        socket: `/run/user/${user.uid}/pmdclock.socket`,
        daemon: true,
        taskTime: 25,
        restTime: 5,
        largeRestTime: 20,
        showNotifications: true,
        notifyEach: 30,
    });
