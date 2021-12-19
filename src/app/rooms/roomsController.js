const jwtMiddleware = require("../../../config/jwtMiddleware");
const roomsProvider = require("../../app/rooms/roomsProvider");
const roomsService = require("../../app/rooms/roomsService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

//const regexrooms_email = require("regex-email");
const {emit} = require("nodemon");

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
// exports.getTest = async function (req, res) {
//     return res.send(response(baseResponse.SUCCESS))
// }

/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/roomss
 exports.getTest = async (req, res) => {
  //roomsProvider.testMySQL
  try {
    const testResult = await roomsProvider.testMySQL();
    console.log("controller", testResult);
    return res.status(200).json(testResult);
  } catch (error) {
    console.error(error);
  }
};
*/
//app/rooms?userId=?

exports.postrooms = async function (req, res) {


    const {hostId, name, address, latitude, longitude, price, wishes, commission, tax, cleanCost, description, checkInTime,
        checkOutTime, returnPolicy, status} = req.body;

    // 유저가 호스트인지 체크
    /*const checkHost = await roomsProvider.hostIdCheck(hostId);
    if (checkHost[0].status != "host")
        return res.send(response(baseResponse.USER_NOT_HOST));
        */
    const userIdFromJwt = req.tokenInfo.userId;
    const userStatusFromJwt = req.tokenInfo.status;
    if(userIdFromJwt != hostId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if( userStatusFromJwt != "host" && userStatusFromJwt != "superhost") return res.send(errResponse(baseResponse.USER_NOT_HOST));


    // 기타 등등 - 추가하기
   
    const signUpResponse = await roomsService.createRooms(
        hostId, name, address, latitude, longitude, price, wishes, commission, tax, cleanCost, description, checkInTime,
        checkOutTime, returnPolicy, status
    );
    return res.send(signUpResponse);
};

exports.getRooms = async function (req, res) {

    const name = req.query.roomsName;

    if(!name) {
        const roomsListResult = await roomsProvider.retrieveRoomsList();
        return res.send(response(baseResponse.SUCCESS, roomsListResult));
    }
    else{
        const roomListByName = await roomsProvider.retrieveRoom(name);
        return res.send(response(baseResponse.SUCCESS, roomListByName));
    }

};

exports.getRoomsByRoomsId = async function (req, res) {

    const roomsId = req.params.roomsId;

    if(!roomsId)  return res.send(errResponse(baseResponse.ROOMS_ID_EMPTY));
    else {
        const roomInfoByRoomsId = await roomsProvider.getRoomsByRoomsId(roomsId);
        return res.send(response(baseResponse.SUCCESS, roomInfoByRoomsId));
    }
}

exports.getRoomsByHostId = async function (req, res) {

    const hostId = req.params.hostId;

    if(!hostId) return res.send(errResponse(baseResponse.HOST_ID_EMPTY));
    else {
        const roomListByHostId = await roomsProvider.getRoomsByHostId(hostId);
        return res.send(response(baseResponse.SUCCESS, roomListByHostId));
    }

};

exports.patchRooms = async function (req, res) {

    const roomsId = req.params.roomsId;
    const option = req.params.option;
    const value = req.body.value;
    const roomInfoByRoomsId = await roomsProvider.getRoomsByRoomsId(roomsId);
    const hostId = roomInfoByRoomsId.host_id;     //hostid
    const userIdFromJwt = req.tokenInfo.userId;     // 쿼리
    const userStatusFromJwt = req.tokenInfo.status;
    console.log(roomInfoByRoomsId.host_id);
    // host 권한 확인
    if(userIdFromJwt != hostId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if( userStatusFromJwt != "host" && userStatusFromJwt != "superhost") return res.send(errResponse(baseResponse.USER_NOT_HOST));

    if (!option) return res.send(errResponse(baseResponse.OPTION_EMPTY));

    if(option == "name") {
        const editRoomsName = await roomsService.editRooms(roomsId, value, option);
        return res.send(editRoomsName);
    }
    else if(option == "addr"){
        const editRoomsaddr = await roomsService.editRooms(roomsId, value, option);
        return res.send(editRoomsaddr);
    }
    else if(option == "price") {
        const editRoomsPrice = await roomsService.editRooms(roomsId, value, option);
        return res.send(editRoomsPrice);
    }
    else if(option == "commission") {
        const editRoomsCommission = await roomsService.editRooms(roomsId, value, option);  
        return res.send(editRoomsCommission); 
    }
    else if(option == "cleanCost") {
        const editRoomscleanCost = await roomsService.editRooms(roomsId, value, option);
        return res.send(editRoomscleanCost);
    }
    else if(option == "description") {
        const editRoomsDescription = await roomsService.editRooms(roomsId, value, option);
        return res.send(editRoomsDescription);
    }
         
    return res.send(editRoomsInfo);
    
};
exports.deleteRoomsInfo = async function (req, res) {
    const userIdResult = req.tokenInfo.userId;
    const userId = req.query.userId;
    const status = req.tokenInfo.status;

    if (userIdResult != userId) 
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (status == 'withdrawl')
        res.send(errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT));

    const deleteUserInfo = await userService.deleteUserInfo(userId);

    return res.send(response(baseResponse.SUCCESS));
}