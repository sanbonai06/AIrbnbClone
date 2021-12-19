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
        
        console.log(`추가된 방 : ${RoomIdResult[0].insertId} \n 호스트ID : ${hostId}`);
        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createRooms Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editRooms = async function (id, val, option) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        if(option == "name") {
            const editRoomsNameResult = await roomsDao.updateRoomsName(connection, id, val)
            response(baseResponse.SUCCESS); 
        }
        else if(option == "addr"){
            const editRoomsAddrResult = await roomsDao.updateRoomsAddr(connection, id, val) 
        }
        else if(option == "price") {
            const editRoomsPriceResult = await roomsDao.updateRoomsPrice(connection, id, val) 
        }
        else if(option == "commission") {
            const editRoomsCommissionResult = await roomsDao.updateRoomsCommission(connection, id, val) 
        }
        else if(option == "cleanCost") {
            const editRoomsCleanCostResult = await roomsDao.updateRoomsCleanCost(connection, id, val) 
        }
        else if(option == "description") {
            const editRoomsDescription = await roomsDao.updateRoomsDescription(connection, id, val)
        }
           // const editRoomsResult = await roomsDao.updateRoomsCleanCost(connection, id, val) 
        connection.release();
        console.log("방 번호 " + id + " 방의 " +  option + "이/가 수정 되었습니다.");
        return; //response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editRooms Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.deleteRoomsInfo = async function(id) {
    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const status = "closed";
        const deleteRoomsResult = await roomsDao.deleteRooms(connection, id);

        connection.release();
        console.log("방 번호 " + id + " 방은 이제 이용 불가능합니다.");
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        logger.error(`App - deleteRooms Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}