const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const roomsProvider = require("./roomsProvider");
const roomsDao = require("./roomsDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createRooms = async function (hostId, name, address, latitude, longitude, price, wishes, commission, tax, cleanCost, description, checkInTime,
    checkOutTime, returnPolicy, status) {
    try {
        // 방 이름 중복 확인
        const nameRows = await roomsProvider.nameCheck(name);
        if (nameRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_ROOMNAME);
        
        const insertRoomsInfoParams = [hostId, name, address, latitude, longitude, price, wishes, commission, tax, cleanCost, description, checkInTime,
            checkOutTime, returnPolicy, status];

        const connection = await pool.getConnection(async (conn) => conn);
        const RoomIdResult = await roomsDao.insertRoomsInfo(connection, insertRoomsInfoParams);
        console.log(`추가된 방 : ${RoomIdResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

