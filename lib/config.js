"use strict";

const os = require("os");
const etc = require("etc");

const user = os.userInfo();

module.exports = etc()
    .add({
        socket: `/run/user/${user.uid}/pmdclock.socket`,
        daemon: true
    });