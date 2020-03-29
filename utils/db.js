'use strict';
const config = require('config');
const { Client } = require('pg');
const postgresUser = "postgres";
const postgresDb = "chatapp";
const postgresPass = "12345678";
var connectionString = `postgres://${postgresUser}:${postgresPass}@localhost:5432/${postgresDb}`;

class Db {
    constructor() {
        this.connection = new Client({
            connectionString: connectionString
        });
        this.connection.connect();
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            })
        });
    }
}

module.exports = new Db();
