const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const roomsProvider = require("../rooms/roomsProvider");
const roomsService = require("../rooms/roomsService");
const regexuser_email = require("regex-email");
const {emit} = require("nodemon");
const baseResponseStatus = require("../../../config/baseResponseStatus");
const { createWishlist } = require("./userDao");

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
 * [POST] /app/users
 exports.getTest = async (req, res) => {
  //userProvider.testMySQL
  try {
    const testResult = await userProvider.testMySQL();
    console.log("controller", testResult);
    return res.status(200).json(testResult);
  } catch (error) {
    console.error(error);
  }
};
*/
exports.postUsers = async function (req, res) {

    /**
     * Body: user_email, password, name, sex, phonenum, birth, status
     */
    const {user_email, password, name, sex, phonenum, birth, status} = req.body;

    // 빈 값 체크
    if (!user_email)
        return res.send(response(baseResponse.SIGNUP_user_email_EMPTY));

    // 길이 체크
    if (user_email.length > 30)
        return res.send(response(baseResponse.SIGNUP_user_email_LENGTH));

    // 형식 체크 (by 정규표현식)
    if (!regexuser_email.test(user_email))
        return res.send(response(baseResponse.SIGNUP_user_email_ERROR_TYPE));

    // 기타 등등 - 추가하기
   
    const signUpResponse = await userService.createUser(
        user_email, password, name, sex, phonenum, birth, status
    );
    return res.send(signUpResponse);
};

/**
 * API No. 2
 * API Name : 유저 조회 API (+ 이메일로 검색 조회)
 * [GET] /app/users
 */
exports.getUsers = async function (req, res) {

    /**
     * Query String: user_email
     */
    const user_email = req.query.user_email;

    if (!user_email) {
        // 유저 전체 조회
        const userListResult = await userProvider.retrieveUserList();
        return res.send(response(baseResponse.SUCCESS, userListResult));
    } else {
        // 유저 검색 조회
        const userListByuser_email = await userProvider.retrieveUserList(user_email);
        return res.send(response(baseResponse.SUCCESS, userListByuser_email));
    }
};

/**
 * API No. 3
 * API Name : 특정 유저 조회 API
 * [GET] /app/users/{userId}
 */
exports.getUserById = async function (req, res) {

    /**
     * Path Variable: userId
     */
    const userId = req.params.userId;

    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    const userByUserId = await userProvider.retrieveUser(userId);
    return res.send(response(baseResponse.SUCCESS, userByUserId));
};

// 예약 API
exports.postReservation = async function (req, res) {


    const {user_email, room_id, adults, childeren, infants, pets, check_in_date, check_out_date} = req.body;
    
    const userIdFromJWT = req.tokenInfo.userId;
    const userId = req.params.userId;

    if(userIdFromJWT != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!user_email) 
        return res.send(errResponse(baseResponse.SIGNUP_user_email_EMPTY));
    if (!regexuser_email.test(user_email))
        return res.send(response(baseResponse.SIGNUP_user_email_ERROR_TYPE));
    if (!room_id) 
        return res.send(errResponse(baseResponse.ROOMS_ID_EMPTY));
    const roomsInfo = await roomsProvider.getRoomsByRoomsId(room_id);
    const rooms_status = roomsInfo[0].status;
    //if(rooms_status != 'available') return res.send(errResponse(baseResponse.SIGNUP_DISAVAILABLE_ROOM));
    
    const signUpReservation = await userService.createReservation(user_email, room_id, adults, childeren,
         infants, pets, check_in_date, check_out_date);

    return res.send(signUpReservation);
};

// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : user_email, passsword
 */
exports.login = async function (req, res) {

    const {user_email, password} = req.body;

    // TODO: user_email, password 형식적 Validation
    if (!user_email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));

    // 길이 체크
    if (user_email.length > 30)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));

    // 형식 체크 (by 정규표현식)
    if (!regexuser_email.test(user_email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    const signInResponse = await userService.postSignIn(user_email, password);

    return res.send(signInResponse);
};


/**
 * API No. 5
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/:userId
 * path variable : userId
 * body : nickname
 */
exports.patchUsers = async function (req, res) {

    // jwt - userId, query :userId  

    const userIdFromJWT = req.tokenInfo.userId;
    console.log(req.tokenInfo);
    const userId = req.query.userId;
    console.log(userId);
    const option = req.params.option;
    const value = req.body.value;
    // 권한 확인
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    if (!option) return res.send(errResponse(baseResponse.OPTION_EMPTY));

    if(option == "name") {
        const editUserName = await userService.editUser(userId, value, option);
        return res.send(editUserName);
    }
    else if(option == "sex"){
        const editUserSex = await userService.editUser(userId, value, option);
        return res.send(editUserSex);
    }
    else if(option == "birth") {
        const editUserBirth = await userService.editUser(userId, value, option);
        return res.send(editUserBirth);
    }
    else if(option == "email") {
        const editUserEmail = await userService.editUser(userId, value, option);  
        return res.send(editUserEmail); 
    }
    else if(option == "phonenum") {
        const editUserPhonenum = await userService.editUser(userId, value, option);
        return res.send(editUserPhonenum);
    }
         
    return res.send(response(baseResponse.SUCCESS));
    
};

exports.patchUsersStatus = async function (req, res) {

    const userIdFromJWT = req.tokenInfo.userId;
    const userId = req.query.userId;
    const status = req.body.status;
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!status) return res.send(errResponse(baseResponse.USER_CHANGE_STATUS_EMPTY));

        const editUserInfo = await userService.editUserStatus(userId, status)
        return res.send(editUserInfo);
    }
};

/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.tokenInfo.userId;
    console.log(userIdResult + " 회원이 자동 로그인 되었습니다.");

    const userInfo = await userProvider.retrieveUser(userIdResult);
    
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS, userInfo));
};

exports.delete = async function (req, res) {
    const userIdResult = req.tokenInfo.userId;
    const userId = req.query.userId;
    const status = req.tokenInfo.status;
    //console.log(status);
    if (userIdResult != userId) 
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (status == 'withdrawl')
        res.send(errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT));

    const deleteUserInfo = await userService.deleteUserInfo(userId);

    return res.send(response(baseResponse.SUCCESS));
}

exports.postReview = async function (req, res) {
    
    const userIdResult = req.tokenInfo.userId;
    const userId = req.params.userId;
    const roomId = req.params.roomId;
    const reviewDiscript = req.body.discript;

    if(userIdResult != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const reservationInfo = await userService.getReservationInfo(userId, roomId); 
    //리뷰 권한 확인
    if(reservationInfo[0].length < 1) return res.send(errResponse(baseResponse.SIGNUP_NOT_USE_ROOM));

    const postReview = await userService.createReview(userId, roomId, reviewDiscript);

    return res.send(postReview);
}

exports.updateReview = async function (req, res) {

    const userIdResult = req.tokenInfo.userId;
    const userId = req.params.userId;
    const reviewId = req.params.reviewId;
    const discript = req.body.discript;

    if(userIdResult != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const getReviewByReviewId = await userProvider.getReview(reviewId);
    const reviewOfUserId = getReviewByReviewId[0].user_id;
    const reviewStatus = getReviewByReviewId[0].status;

    if(reviewOfUserId != userId) return res.send(errResponse(baseResponse.SIGNUP_REVIEW_USERID));
    if(reviewStatus != 'exist') return res.send(errResponse(baseResponse.SIGNUP_NONEXISTENT_REVIEW));

    const updateReview = await userService.editReview(reviewId, discript);

    return res.send(updateReview);
}

exports.deleteReview = async function (req, res) {

    const userIdResult = req.tokenInfo.userId;
    const userId = req.params.userId;
    const reviewId = req.params.reviewId;

    if(userIdResult != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const getReviewByReviewId = await userProvider.getReview(reviewId);
    const reviewOfUserID = getReviewByReviewId[0].user_id;
    const reviewStatus = getReviewByReviewId[0].status;

    if(reviewOfUserID != userId) return res.send(errResponse(baseResponse.SIGNUP_REVIEW_USERID));
    if(reviewStatus != "exist") return res.send(errResponse(baseResponse.SIGNUP_NONEXISTENT_REVIEW));
    const deleteReview = await userService.deleteReview(reviewId);

    return res.send(deleteReview);
}

exports.deleteReservation = async function (req ,res) {

    const userIdResult = req.tokenInfo.userId;
    const userId = req.params.userId;
    const reservationId = req.params.reservationId;

    if(userIdResult != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    
    const getReservation = await userProvider.getReservation(reservationId);
    const userIdByReservation = getReservation[0].user_id;

    if(userId != userIdByReservation) return res.send(errResponse(baseResponse.SIGNUP_NOT_RESERVATION_MATCH));

    const deleteReservationResult = await userService.deleteReservation(reservationId);

    return res.send(deleteReservationResult);
}

exports.createWishlist = async (req, res) => {

    const userIdResult = req.tokenInfo.userId;
    const wishlistName = req.body.name;
    const userId = req.params.userId;
    const roomId = req.params.roomId;

    if(userIdResult != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const getWishlistResult = await userProvider.retrieveWishlist(userId, wishlistName);
    //위시리스트를 새로 만들면서 추가
    if(getWishlistResult.length < 1) {
        const createWishlistResult = await userService.createWishlist(wishlistName, userId);    //트랜잭션 처리로 롤백 넣자
        const getCreateWishlist = await userProvider.retrieveWishlist(userId, wishlistName);
        const wishlistId = getCreateWishlist[0].wishlist_id;
        const addWish = await userService.addWish(userId, roomId, wishlistId);
        return res.send(addWish);
    }
    else {                  
        const wishlistId = getWishlistResult[0].wishlist_id;                                            //이미 존재하는 위시리스트에 추가 할 때..
        const getWishResult = await userProvider.retrieveWish(roomId, wishlistId);
        if(getWishResult.length >= 1) return res.send(errResponse(baseResponse.SIGNUP_ALREADYEXIST_ROOM));

        const addWish = await userService.addWish(userId, roomId, wishlistId);
        return res.send(addWish);
    }


}

exports.showWishlist = async (req, res) => {
    
    const userIdFromJWT = req.tokenInfo.userId;
    const userId = req.params.userId;
    const wishlistId = req.params.wishlistId;
    
    if(userIdFromJWT != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const showWishlistResult = await userProvider.retrieveWishlistInfo(wishlistId);
    
    return res.send(response(baseResponse.SUCCESS, showWishlistResult));
}

exports.getReservation = async (req ,res) => {

    const userIdFromJWT = req.tokenInfo.userId;
    const userId = req.params.userId;
    const reservationId = req.params.reservationId;

    if(userIdFromJWT != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const getReservationResult = await userProvider.retrieveReservation(reservationId);

    return res.send(response(baseResponse.SUCCESS, getReservationResult));
}

exports.updateWishlist = async (req, res) => {

    const userIdFromJWT = req.tokenInfo.userId;
    const userId = req.params.userId;
    const wishlistId = req.params.wishlistId;
    const option = req.body.option;
    const value = req.body.value;

    if(userId != userIdFromJWT) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    if(option === "name") {
        const updateWishlistName = await userService.updateWishlistName(wishlistId, value);
    }
    else if(option === "deleteRooms") {
        const updateWishlistInfo = await userService.updateWishlistInfo(wishlistId, value);
    }

    return res.send(response(baseResponse.SUCCESS));
}

exports.postRank = async (req, res) => {

    const userIdFromJWT = req.tokenInfo.userId;
    const userId = req.params.userId;
    const roomId = req.params.roomId;
    const item1 = req.body.item1;
    const item2 = req.body.item2;
    const item3 = req.body.item3;
    const item4 = req.body.item4;
    const item5 = req.body.item5;
    const item6 = req.body.item6;
    const total = (item1 + item2 + item3 + item4 + item5 + item6)/6;
    if(userIdFromJWT != userId) return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));

    const getRankResult = await userProvider.retrieveRank(roomId);
    if(getRankResult.length < 1) {
        const createEvaluation = await userService.createEvaluation(roomId, item1, item2, item3, item4, item5, item6, total);
    }
    else {
    const createRankResult = await userProvider.retrieveRank(roomId);
    const rank1 = (createRankResult[0].item1 + item1)/2;
    const rank2 = (createRankResult[0].item2 + item2)/2;
    const rank3 = (createRankResult[0].item3 + item3)/2;
    const rank4 = (createRankResult[0].item4 + item4)/2;
    const rank5 = (createRankResult[0].item5 + item5)/2;
    const rank6 = (createRankResult[0].item6 + item6)/2;
    const totalRank = (createRankResult[0].total + total)/2;
    const evaluationRankResult = await userService.postRank(roomId, rank1, rank2, rank3, rank4, rank5, rank6, totalRank);
    }

    return res.send(response(baseResponse.SUCCESS));
}
