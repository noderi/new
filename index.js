'use strict';
require('./helpers/startchecks')();
const config = require("./config/config.json");

// Require libraries
const discord = require('discord.js');
const mysql = require('mysql');
const chalk = require('chalk');
const winston = require('winston');
const fs = require('fs');
const apiJS = require('./api/api');
let api;

// Declare some useful things
module.exports.logger = new winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: winston.format.json()
        }),
        new winston.transports.File({
            filename: "logs/combined.log",
            format: winston.format.json()
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({colors: {info: 'blue', warn: 'yellow', error: 'red'}, all: true}),
                winston.format.simple()
            )
        })
    ]
})
module.exports.con = mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.db,
    timeout: 21600000
});

const Client = new discord.Client();
Client.commands = new discord.Collection();

// Another time when I realise I am a very quiet person in code, literally

if (config.web.enabled) {
    api = new apiJS(this.con);
    api.listen(config.web.port, config.web.host).then(() => {
        this.logger.info("REST API is online on port" + config.web.port)
    }) // No not a web host, but if you do need web hosting, be sure to check out senvhost.com. They are good.
}

this.logger.info(`Attempting to load commands...`)
fs.readdir("./commands", 'utf-8', (err, files) => {
    if (err) {
        this.logger.error(err)
        setTimeout(() => {
            process.exit(1);
        }, 10000)
    }
    let jsfile  = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        this.logger.error("No command files found. Shutting down in 10 seconds.")
        setTimeout(() => {
            process.exit(1);
        }, 10000)
    }
    jsfile.forEach(f => {
        this.logger.info(`Loading command ${f}`)
        let props = require(`./commands/${f}`);
        Client.commands.set(props.help.name, props);
    });
});

this.logger.info(`Attempting to load events...`)
fs.readdir("./events", 'utf-8', (err, files) => {
    if (err) {
        this.logger.error(err);
        setTimeout(() => {
            process.exit(1);
        }, 10000)
    }
    let jsfile  = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        this.logger.error("No event files found. Shutting down in 10 seconds.")
        setTimeout(() => {
            process.exit(1);
        }, 10000)
    }
    jsfile.forEach(f => {
        this.logger.info(`Loading event ${f}`)
        let event = require(`./events/${f}`);
        Client.on(f.split(".")[0], event.bind(null, Client));
    })
});

setInterval(() => {
    this.con.query(`SELECT * FROM licenses`, (err, rows) => {
        if (err) throw err;
    })
}, 120000)

Client.login(config.token)
