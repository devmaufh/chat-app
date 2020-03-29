'use strict';

const moment = require('moment');
const path = require('path');
const fs = require('fs');
const helper = require('./helper');

class Socket {
    constructor(socket) {
        this.io = socket;
    }
    socketEvents() {
        this.io.on('connection', (socket) => {
            
            /**
             * Obtiene los usuarios conectados
             */
            socket.on('chatList', async (userId) => {
                const result = await helper.getChatList(userId);

                this.io.to(socket.id).emit('chatListRes', {
                    userConnected: false,
                    chatList: result.usersList.rows
                });

                const user_data = await helper.getUserData(userId);
                socket.broadcast.emit('chatListRes', {
                    userConnected: true,
                    userId: userId,
                    socket_id: socket.id,
                    userData: user_data.rows[0]
                });
            });
           
            /**
             * Obtiene los mensajes
             */
            socket.on('getMessages', async (data) => {
                const result = await helper.getMessages(data.fromUserId, data.toUserId);
                if (result === null) {
                    this.io.to(socket.id).emit('getMessagesResponse', { result: [], toUserId: data.toUserId });
                } else {
                    this.io.to(socket.id).emit('getMessagesResponse', { result: result.rows, toUserId: data.toUserId })
                }
            });
            /**
             * Enviar mensajes
             */
            socket.on('addMessage', async (response) => {
                response.date = new moment().format("Y-MM-D");

                response.time = new moment().format("hh:mm A");

                helper.insertMessages(response, socket);

                socket.to(response.toSocketId).emit('addMessageResponse', response);
               
            });
            socket.on('disconnect', async () => {
                const isLoggedOut = await helper.noVisible(socket.id);
                socket.broadcast.emit('chatListRes', {
                    userDisconnected: true,
                    socket_id: socket.id
                });
            });
        });
    }

    socketConfig() {
        this.io.use(async (socket, next) => {
            let userId = socket.request._query['id'];
            let userSocketId = socket.id;
            const response = await helper.addSocketId(userId, userSocketId);
            if (response && response !== null) {
                next();
            } else {
                console.error(`Socket connection failed, for  user Id ${userId}.`);
            }
        });
        this.socketEvents();
    }
}


module.exports = Socket;
