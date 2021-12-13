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
exports.postrooms = async function (req, res) {


    const {hostId, name, address, latitude, longitude, price, wishes, commission, tax, cleanCost, description, checkInTime,
        checkOutTime, returnPolicy, status} = req.body;

    // 유저가 호스트인지 체크
    const checkHost = await roomsProvider.hostIdCheck(hostId);
    if (checkHost[0].status != "host")
        return res.send(response(baseResponse.USER_NOT_HOST));

    // 기타 등등 - 추가하기
   
    const signUpResponse = await roomsService.createRooms(
        hostId, name, address, latitude, longitude, price, wishes, commission, tax, cleanCost, description, checkInTime,
        checkOutTime, returnPolicy, status
    );
    return res.send(signUpResponse);
};

exports.getrooms = async function (req, res) {

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
