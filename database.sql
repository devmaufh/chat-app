create database chatapp;

create table users(id serial primary key, name varchar(100), email varchar(150), socket_id varchar(150), status integer);

create table messages(id serial primary key,from_user_id integer,to_user_id integer,message text, date date, time varchar(25));



insert into users(name, email) values('Mauricio', 'mau1361317@gmail.com'), ('Cachito','cachito@g.com');