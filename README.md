# pmdclock, a simple CLI pomodoro clock

Clock for pomodore control based on an agent

## Features:

* 100% CLI
* Configurable times
* Continuous mode
* Persist taks history on disk
* Notification by libnotify (Desktop integrated)
* Execute custom command when finish time
* Auto large rests after x completed tasks

# Install 

You need node.js (~7.4.0 recommended) and npm installed.

    $ sudo npm install -g pmdclock

# Usage

Start the agent:

    $ pmdclock agent
    Starting agent
    $

Start new task

    $ pmdclock start -n "Cooking potatoes"
    Task started!

Let's work...

Get information

    $ pmdclock info
    Cooking potatoes finish in 17 minutes

Finish the task

    $ pmdclock finish
    Task finished! in 8 minutes

Take a rest

    $ pmdclock rest
    Rest started!

Or, a large rest:
    
    $ pmdclock rest --large
    Large rest started!, be happy
    $ pmdclock finish
    Rest finished at 1 minutes

Check the history:

    $ pmdclock list
    ┌───┬──────────────────┬──────────────────┬──────────────────┬──────────┐
    │   │ Name             │ Started          │ Finished         │ On time  │
    │ * │ Cooking potatoes │ Today at 5:05 PM │ Today at 5:13 PM │ -25 mins │
    │ - │ Rest             │ Today at 5:14 PM │ Today at 5:15 PM │ -5 mins  │
    └───┴──────────────────┴──────────────────┴──────────────────┴──────────┘

Clear history:

    $ pmdclock clear
    History clear, 2 tasks deleted.
    $ pmdclock list
    Not tasks finished


## Continuous mode

Continuous mode allows to finish tasks starting rest and vice versa:

    $ pmdclock start -n "Cooking potatoes"
    Task started!
    $ pmdclock rest
    Task finished!
    Rest started!
    $ pmdclock start -n "Prepare dishes"
    Rest finished!
    Task started!
    $ pmdclock finish
    Task finished! in 0 minutes 
    $ pmdclock list
    ┌───┬──────────────────┬──────────────────┬──────────────────┬──────────┐
    │   │ Name             │ Started          │ Finished         │ On time  │
    │ * │ Cooking potatoes │ Today at 5:19 PM │ Today at 5:19 PM │ -25 mins │
    │ - │ Rest             │ Today at 5:19 PM │ Today at 5:19 PM │ -5 mins  │
    │ * │ Prepare dishes   │ Today at 5:19 PM │ Today at 5:20 PM │ -25 mins │
    └───┴──────────────────┴──────────────────┴──────────────────┴──────────┘

# Configure

The default configuration uses times by: 25 minutes task, 5 minutes rest and 20
minutes for large rests, but it's configurable via a json file located in
$HOME/.pmdclock/config.yml:

For example:

```yaml
taskTime: 40
restTime: 10
largeRestTime: 30 
```

The complete params are:

|Param|Type|Description|Default value|
|:----|:--:|:----------|:------------|
|socket|String|Path of the socket file for agent|/run/user/{UUID}/pmdclock.socket`|
|db|String|Path of the db file|$HOME/.pmdclock/db.dat|
|daemon|Boolean|Run agent as daemon|true|
|taskTime|Number|Task time in minutes|25|
|restTime|Number|Rest time in minutes|5|
|largeRestTime|Number|Large rest time in minutes|20|
|autoLargeRest|Boolean/Number|Auto set the next rest as large after x complete tasks, if false don't auto-set|4|
|showNotifications|Boolean|Show notifications via libnotify|true|
|runCmd|String|Command to run when time is over|null|
|autoStopCmd|String/Boolean|Stop command on finish task, if is false don't kill the child, if is true, kill with SIGTERM, if is string, use it as signal, enable signals: SIGHUP, SIGINT, SIGQUIT, SIGKILL, SIGTERM, SIGUSR1, SIGUSR2, SIGCHLD, SIGSTOP, SIGTSTP|false|
|notifyEach|Number|Notify each x time, in secods|30|
|infoFormat|String|Output format of comand info[0]|"%n finish in %R"|
|continueMode|Boolean|If start a rest when a task is running, close the task and vise versa|true|
|taskIcon|String|Task icon on list[1]|[x]|
|taskRunningIcon|String|Icon for running task[1]|[>]|
|restIcon|String|Rest icon in list[1]|o/|
|largeRestIcon|String|Large rest icon[1]|...|
|largeRestRunningIcon|String|Icon for running large rest[1]|:D|

## 0: Info variables

The variables start with % and there are:

* **n**: Name of task
* **i**: Icon
* **r**: Time left on mm:ss
* **R**: Time left on human readable format, ej: *13 minutes*
* **e**: Time elapsed on mm:ss
* **E**: Time elapsed on human readable format
* **t**: Number of tomatoes recolected
* **T**: Repeat the taskIcon the total tomatoes recolected times

## 1: Tasks icons

If you use fonts patches with
[Pomicons](https://github.com/gabrielelana/pomicons) you can use it for stylish
output of *list* command.

![pomicons](http://esfriki.com/f/Screenshot_20170113_175015.png)

For use it, define icons as ```\uE001``` and ```\uE005```.

```yaml
taskIcon: "\uE001"
taskRunningIcon: "\uE004"
restIcon: "\uE005"
restRunningIcon: "\uE005"
largeRestIcon: "\uE006"
largeRestRunningIcon: "\uE006"
```

# Usage with i3wm + i3blocks

The reasons why I developed this software, apart from not finding anything
similar that I like, it was to implement it on my desktop with i3 + i3blocks,
so I leave the configuration in case someone else serves:

```
[pomodoro]
command=pmdclock info --format "%T%i %r" | sed "s/^Not tasks.*$//g"
color=#FFFF00
interval=5
```
