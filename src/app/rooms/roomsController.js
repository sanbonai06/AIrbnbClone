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
    console.log(roomInfoByRoomsId);
    const hostId = roomInfoByRoomsId[0].host_id;     //hostid
    const userIdFromJwt = req.tokenInfo.userId;     // 쿼리
    const userStatusFromJwt = req.tokenInfo.status;
    
    // host 권한 확인
    if(userIdFromJwt != hostId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if( userStatusFromJwt != "host" && userStatusFromJwt != "superhost") return res.send(errResponse(baseResponse.USER_NOT_HOST));

    if (!option) return res.send(errResponse(baseResponse.OPTION_EMPTY));

    let editRoomsResult;
    if(option == "name") {
        const editRoomsName = await roomsService.editRooms(roomsId, value, option);
        //return res.send(editRoomsName);
        editRoomsResult = editRoomsName;
    }
    else if(option == "addr"){
        const editRoomsaddr = await roomsService.editRooms(roomsId, value, option);
        //return res.send(editRoomsaddr);
        editRoomsResult - editRoomsaddr
    }
    else if(option == "price") {
        const editRoomsPrice = await roomsService.editRooms(roomsId, value, option);
      //return res.send(editRoomsPrice);
      editRoomsResult = editRoomsPrice;
    }
    else if(option == "commission") {
        const editRoomsCommission = await roomsService.editRooms(roomsId, value, option);  
        //return res.send(editRoomsCommission); 
        editRoomsResult = editRoomsCommission;
    }
    else if(option == "cleanCost") {
        const editRoomscleanCost = await roomsService.editRooms(roomsId, value, option);
        //return res.send(editRoomscleanCost);
        editRoomsResult = editRoomscleanCost;
    }
    else if(option == "description") {
        const editRoomsDescription = await roomsService.editRooms(roomsId, value, option);
        //return res.send(editRoomsDescription);
        editRoomsResult = editRoomsDescription;
    }
         
    return res.send(response(baseResponse.SUCCESS, editRoomsResult));
    
};
exports.deleteRoomsInfo = async function (req, res) {
    const userIdResult = req.tokenInfo.userId;
    const roomsId = req.params.roomsId;
    const roomInfoByRoomsId = await roomsProvider.getRoomsByRoomsId(roomsId);
    const status = roomInfoByRoomsId[0].status;
    const hostId = roomInfoByRoomsId[0].host_id;

    // 권한 확인
    if(userIdResult != hostId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (status == 'closed')
        res.send(errResponse(baseResponse.SIGNUP_CLOSED_ROOM));

    const deleteRoomsInfo = await roomsService.deleteRoomsInfo(roomsId);

    return res.send(response(baseResponse.SUCCESS));
}

exports.postImage = async function (req, res) {
    const userIdResult = req.tokenInfo.userId;
    const roomsId = req.params.roomsId;
    const imageName = req.body.name;
    const imageUrl = req.body.Url;
    const roomInfoByRoomsId = await roomsProvider.getRoomsByRoomsId(roomsId);
    const hostId = roomInfoByRoomsId[0].host_id;

    if(userIdResult != hostId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const createRoomsImage = await roomsService.uploadImage(roomsId, imageName, imageUrl);

    return res.send(response(baseResponse.SUCCESS));
}

exports.deleteImage = async function (req, res) {
    const userIdResult = req.tokenInfo.userId;
    const roomsId = req.params.roomsId;
    const imageUrl = req.body.Url;
    const roomInfo = await roomsProvider.getRoomsByRoomsId(roomsId);
    const getRoomsImageByimageUrl = await roomsProvider.getRoomsImageByimageUrl(imageUrl);
    const hostId = roomInfo[0].host_id;
    const imageId = getRoomsImageByimageUrl[0].images_id;

    if(userIdResult != hostId) return res.send(errResponse(baseResponse1.USER_ID_NOT_MATCH));
    if(!imageId) return res.send(errResponse(baseResponse.SIGNUP_NOT_IMAGE));

    const deleteRoomsImage = await roomsService.deleteImage(imageId);

    return res.send(response(baseResponse.SUCCESS));
}

exports.serchRooms = async function (req, res) {
    const location = req.params.location;
    const checkInDate = req.params.checkInDate;
    const checkOutDate = req.params.checkOutDate;

    console.log(typeof(checkInDate));
    console.log(typeof(checkOutDate));
    const serchRoomsByLocation = await roomsProvider.getRoomsByLocation(location);

    return res.send(response(baseResponse.SUCCESS));
}
