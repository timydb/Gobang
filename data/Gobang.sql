SET NAMES utf8;
DROP DATABASE IF EXISTS Gobang;
CREATE DATABASE Gobang CHARSET=UTF8;
USE Gobang;

CREATE TABLE users(
    uid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64),
    pwd VARCHAR(16),
    gener INT,
    phone VARCHAR(16),
    email VARCHAR(64),
    reg_time LONG
);
INSERT INTO users(uid,name,pwd,reg_time)VALUES(
    NULL,
    'timy',
    '123',
    1468478012000
);

CREATE TABLE userRecords(
    rid INT PRIMARY KEY AUTO_INCREMENT,
    uid INT,
    off VARCHAR(1),
    records VARCHAR(1000),
    save_time LONG

);
INSERT INTO userRecords VALUES(
    NULL,
    1,
    1,
    '7,7-6,6-6,8-8,6-7,6-7,8-8,7-6,7-6,5-9,8-5,4-4,3-5,6',
    1468916581000
);