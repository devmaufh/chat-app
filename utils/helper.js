'use strict';

const DB = require('./db');
const path = require('path');
const fs = require('fs');

class Helper {
    constructor(app) {
        this.db = DB;
    }
    /**
     * Actualiza el socket_id y el status en la base de datos para mostrar un usuario como "Activo"
     * @param {*} userId Id del usuario al que se le actualizará el socket en la base de datos
     * @param {*} userSocketId Id del socket que genera Socket.IO
     */
    async addSocketId(userId, userSocketId) {
        try {
            return await this.db.query('UPDATE users set socket_id = $1, status = $2 WHERE id = $3', [userSocketId, 1, userId]);
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    /**
     * Cambia el estado del usuario a desconectado y elimina el socket que tenía asignado
     * @param {*} userSocketId Id del socket del usuario que se desconectará del socket
     */
    async noVisible(userSocketId) {
        return await this.db.query('UPDATE users SET socket_id = $1, status = 0 WHERE socket_id = $2', ['', userSocketId])
    }

    /**
     * Obtiene la lista de los usuarios conectados.
     * @param {*} userId ID del usuario que está consultando la lista de usuarios.
     */
    getChatList(userId) {
        try {
            return Promise.all([
                this.db.query(`SELECT * FROM users WHERE id != $1 and status = 1  `, [userId])
            ]).then((response) => {
                return {
                    usersList: response[0]
                };
            }).catch((error) => {
                console.warn(error);
                return (null);
            });
        } catch (error) {
            console.warn(error);
            return null;
        }
    }
    
    /**
     * Inserta un mensaje en la base de datos
     * @param {*} params Params es un JSON que debe contener los datos del mensaje
     */
    async insertMessages(params) {
        try {
            return await this.db.query("INSERT INTO messages (from_user_id,to_user_id,message, date, time) values ($1,$2,$3,$4,$5)", [params.fromUserId, params.toUserId, params.message, params.date, params.time]
            );
        } catch (error) {
            console.warn(error);
            return null;
        }
    }
    
    /**
     * Obtiene los mensajes del usuario que se le pasa por parámetro
     * @param {*} userId ID del usuario que está consultando los mensajes
     * @param {*} toUserId ID del usuario que está consultando los mensajes
     */
    async getMessages(userId, toUserId) {
        try {
            return await this.db.query(
                `SELECT * FROM messages WHERE
					(from_user_id = $1 AND to_user_id = $2 )
					OR
					(from_user_id = $3 AND to_user_id = $4 )	ORDER BY id ASC
				`,
                [userId, toUserId, toUserId, userId]
            );
        } catch (error) {
            console.warn(error);
            return null;
        }
    }

    /**
     * 
     * Obtiene la información del usuario que se le pasa por parámetro
     * @param {*} userId ID del usuario del que se consultará la información
     */
    async getUserData(userId){
        try{
            return await this.db.query('SELECT * FROM users where id = $1',[userId]);
        }catch (error){
            console.warn(error);
            return null;
        }
    }
}

module.exports = new Helper();
