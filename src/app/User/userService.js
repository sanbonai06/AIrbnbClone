const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const roomsProvider = require("../rooms/roomsProvider");
const roomsDao = require("../rooms/roomsDao");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
const res = require("express/lib/response");
const { create } = require("domain");
const axios = require('axios');
const qs = require('qs');
const { nextTick } = require("process");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (user_email, password, name, sex, phonenum, birth, status) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        // 이메일 중복 확인
        const user_emailRows = await userProvider.user_emailCheck(user_email);
        if (user_emailRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);
        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");
        await connection.beginTransaction();
        const insertUserInfoParams = [user_email, hashedPassword, name, sex, phonenum, birth, status];


        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.commit();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        connection.rollback();
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
};

exports.createReservation = async function (user_email, room_id, adults, childeren, infants, pets, check_in_date, check_out_date) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const checkRoomsStatus = await roomsProvider.getRoomsByRoomsId(room_id);
        const checkUserEmail = await userProvider.user_emailCheck(user_email);
        const room_name = checkRoomsStatus[0].room_name;
        
        if(checkRoomsStatus[0].status != "available" ) return errResponse(baseResponse.SIGNUP_DISAVAILABLE_ROOM);
        
        //if(checkUserEmail.length > 1) return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        const userId = checkUserEmail[0].user_id;
        
        const insertReservationParams = [userId, room_id, adults, childeren, infants, pets, check_in_date, check_out_date];
        
        await connection.beginTransaction();
        
        const reservationResult = await userDao.insertReservationInfo(connection, insertReservationParams);
        const changeRoomStatus = await roomsDao.updateRoomsStatus(connection, room_id, 'booked');
    
        console.log(`등록된 예약 번호 : ${reservationResult[0].insertId} 예약한 유저 번호 : ${userId} 예약된 방 번호 : ${room_id}`);
        connection.commit();
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - createReservation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
};

// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (user_email, password) {
    try {
        // 이메일 여부 확인
        const user_emailRows = await userProvider.user_emailCheck(user_email);
        if (user_emailRows.length < 1) return errResponse(baseResponse.SIGNIN_user_email_WRONG);

        const selectuser_email = user_emailRows[0].user_email
        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");
        
        const selectUserPasswordParams = [selectuser_email, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows[0].user_password != hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(user_email);

        if (userInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        console.log("회원번호 " + userInfoRows[0].user_id + " 로그인") // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].user_id,
                status: userInfoRows[0].status,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].user_id, 'jwt': token});

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
   
};

exports.editUser = async function (id, val, option) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        if(option == "name") {
            const editUserNameResult = await userDao.updateUserName(connection, id, val) 
        }
        else if(option == "sex"){
            const editUserSexResult = await userDao.updateUserSex(connection, id, val) 
        }
        else if(option == "birth") {
            const editUserBirthResult = await userDao.updateUserBirth(connection, id, val) 
        }
        else if(option == "email") {
            const editUserEmailResult = await userDao.updateUserEmail(connection, id, val) 
        }
        else if(option == "phonenum") {
            const editUserPhonenumResult = await userDao.updateUserPhoneNum(connection, id, val) 
        }
           // const editUserResult = await userDao.updateUserPhoneNum(connection, id, val) 
        connection.commit();
        console.log("회원번호 " + id + " 님의 " +  option + "이/가 수정 되었습니다.");
        return; //response(baseResponse.SUCCESS);

    } catch (err) {
        connection.rollback();
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.editUserStatus = async function (id, status) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        console.log("회원번호 " + id + " 님의 상태가 " + status + " 가 되었습니다.");
        await connection.beginTransaction();
        const editUserStatusResult = await userDao.updateUserStatus(connection, id, status)
        connection.commit();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        connection.rollback();
        logger.error(`App - editUserStatus Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.deleteUserInfo = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        console.log("회원번호 " + id + " 님의 상태가 비활성화 되었습니다.");
        await connection.beginTransaction();
        const deleteUserResult = await userDao.updateUserStatus(connection, id, 'withdrawl')
        connection.commit();

        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - editUserDelete Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.getReservationInfo = async function (userId, roomId) {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        await connection.beginTransaction();
        const reservationInfoRow = await userDao.getReservationInformation(connection, userId, roomId);
        connection.commit();

        return reservationInfoRow;
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - getReservationInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.createReview = async function (userId, roomId, review) {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!review) return errResponse(baseResponse.SIGNUP_REVIEW_EMPTY);

        await connection.beginTransaction();
        const insertParams = [userId, roomId, review];
        const createReviewResult = await userDao.postReview(connection, insertParams);
        connection.commit();
        console.log(`회원 아이디 ${userId}님이 방 아이디 ${roomId}에 대하여 리뷰를 작성하셨습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - postReview Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.editReview = async function (reviewId, text) {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!text) return errResponse(baseResponse.SIGNUP_REVIEW_EMPTY);
        if(!reviewId) return errResponse(baseResponse.SIGNUP_NONEXISTENT_REVIEW);
        await connection.beginTransaction();
        const updateReviewResult = await userDao.updateReview(connection, reviewId, text);
        connection.commit();
        console.log(`리뷰 아이디 ${reviewId}의 리뷰가 수정되었습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - editReview Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.deleteReview = async function (reviewId) {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!reviewId) return errResponse(baseResponse.SIGNUP_REVIEWID_EMPTY);
        await connection.beginTransaction();
        const deleteReviewResult = await userDao.deleteReview(connection, reviewId);
        connection.commit();
        console.log(`리뷰 아이디 ${reviewId}의 리뷰가 삭제되었습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - deleteReview Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.deleteReservation = async (id) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!id) return errResponse(baseResponse.SIGNUP_RESERVATIONID_EMPTY);
        await connection.beginTransaction();
        const deleteReservation = await userDao.deleteReservation(connection, id);
        connection.commit();
        console.log(`예약 아이디 ${id}의 예약이 삭제되었습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - deleteReservation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.createWishlist = async (name, userId) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!name) return errResponse(baseResponse.SIGNUP_WISHLISTNAME_EMPTY);
        await connection.beginTransaction();
        const insertParams = [name, userId];
        const createWishlist = await userDao.createWishlist(connection, insertParams);
        connection.commit();

        const wishlistId = createWishlist[0].insertId;
        console.log(`${userId}의 위시리스트 ${wishlistId} : ${name}이/가 등록되었습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - createWishlist Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.addWish = async (userId, roomId, wishlistId) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!wishlistId) return errResponse(baseResponse.SIGNUP_WISHLSITID_EMPTY);
        await connection.beginTransaction();
        const insertParams = [roomId, wishlistId];
        const addWishMiddle = await userDao.addWish(connection, insertParams);
        connection.commit();

        console.log(`${userId}번 유저가 ${roomId}번 방을 위시에 추가했습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - createWishlist Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.updateWishlistName = async (Id, val) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!Id) return errResponse(baseResponse.SIGNUP_WISHLSITID_EMPTY);
        await connection.beginTransaction();
        const modifyWishlistName = await userDao.updateWishlistName(connection, Id, val);
        connection.commit();

        console.log(`${Id}번 위시리스트의 이름이 ${val}로 변경되었습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - createWishlist Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.updateWishlistInfo = async (Id, val) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!Id) return errResponse(baseResponse.SIGNUP_WISHLSITID_EMPTY);
        await connection.beginTransaction();
        const modifyWishlistInfo = await userDao.updateWishlistInfo(connection, Id, val);
        connection.commit();

        console.log(`${Id}번 위시리스트에서 ${val}번 방이 삭제되었습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - updateWishlist Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.postRank = async (Id, item1, item2, item3, item4, item5, item6, total) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!Id) return errResponse(baseResponse.ROOMS_ID_EMPTY);
        if((item1 < 0 || item1 > 5) || (item2 < 0 || item2 > 5) || (item3 < 0 || item3 > 5) || (item4 < 0 || item4 > 5)
        || (item5 < 0 || item5 > 5) || (item6 < 0 || item6 > 5 ) || (total < 0 || total > 5)) 
            return errResponse(baseResponse.SIGNUP_RANKERR);
        
        await connection.beginTransaction();

        const insertParams = [item1, item2, item3, item4, item5, item6, total, Id];
        const evaluationRankRow = await userDao.postRank(connection, insertParams);
        connection.commit();

        console.log(`${Id}번 방에 대한 별점 평가가 완료되었습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - postRank Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.createEvaluation = async (Id, item1, item2, item3, item4, item5, item6, total) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        if(!Id) return errResponse(baseResponse.ROOMS_ID_EMPTY);
        if((item1 < 0 || item1 > 5) || (item2 < 0 || item2 > 5) || (item3 < 0 || item3 > 5) || (item4 < 0 || item4 > 5)
        || (item5 < 0 || item5 > 5) || (item6 < 0 || item6 > 5 ) || (total < 0 || total > 5)) 
            return errResponse(baseResponse.SIGNUP_RANKERR);
        
        await connection.beginTransaction();

        const insertParams = [item1, item2, item3, item4, item5, item6, total, Id];
        const evaluationRankRow = await userDao.createEvaluation(connection, insertParams);
        connection.commit();

        console.log(`${Id}번 방에 대한 별점 생성이 완료되었습니다.`);
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - createEvaluation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}

exports.kakaoLogin = async (token) => {

    try{
        const userInfo = await axios({
            method:'GET',
            url:'https://kapi.kakao.com/v2/user/me',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            }
        })
        
        return userInfo;
    }
    catch (err) {
        logger.error(`App - kakaoLogin Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
/*exports.getToken = async (kakao) =>{
    //console.log(kakao);
    let token;
    try{
        token = await axios({
            method:'POST',
            url: `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${kakao.clientId}&redirect_uri=${kakao.redirectUri}&code=${kakao.kakaoCode}`,
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            }
        });
        console.log(token);
        return token;
    }
    catch (err){
        logger.error(`App - getToken Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}   
*/
exports.getToken = async (Id, Uri, code) => {
    try{
        const token = await axios({
            method:'POST',
           // url:`https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${Id}&redirect_uri=${Uri}&code=${code}`,
           url: 'https://kauth.kakao.com/oauth/token',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            data: qs.stringify({
                grant_type: 'authorization_code',
                client_id: Id,
                redirect_uri: Uri,
                code: code
            })
        });
        console.log(token.data.aceess_token);
        return token;
    }
    catch (err) {
        logger.error(`App - getToken Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.createKakaoUser = async (email, name) => {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        await connection.beginTransaction();
        const createUserKakao = await userDao.createUserKakao(connection, email, name);
        connection.commit();
        console.log(`${createUserKakao[0].insertId}님이 카카오회원으로 가입하셨습니다.`);
    }
    catch (err) {
        connection.rollback();
        logger.error(`App - createUserByKakao Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally {
        connection.release();
    }
}