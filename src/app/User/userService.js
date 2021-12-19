const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const roomsProvider = require("../rooms/roomsProvider");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
const res = require("express/lib/response");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (user_email, password, name, sex, phonenum, birth, status) {
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
        
        const insertUserInfoParams = [user_email, hashedPassword, name, sex, phonenum, birth, status];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createReservation = async function (user_email, room_name, adults, childeren, infants, pets, check_in_date, check_out_date) {
    try {
        const checkRoomsStatus = await roomsProvider.retrieveRoom(room_name);
        const checkUserEmail = await userProvider.user_emailCheck(user_email);
        
        if(checkRoomsStatus.status === "disavailable" ) return errResponse(baseResponse.SIGNUP_DISAVAILABLE_ROOM);
        
        //if(checkUserEmail.length > 1) return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        const userId = checkUserEmail[0].user_id;
        
        const insertReservationParams = [userId, room_name, adults, childeren, infants, pets, check_in_date, check_out_date];
        const connection = await pool.getConnection(async (conn) => conn);
      
        
        const reservationResult = await userDao.insertReservationInfo(connection, insertReservationParams);
    
        console.log(`등록된 예약 번호 : ${reservationResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        logger.error(`App - createReservation Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
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
    try {
        const connection = await pool.getConnection(async (conn) => conn);
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
        connection.release();
        console.log("회원번호 " + id + " 님의 " +  option + "이/가 수정 되었습니다.");
        return; //response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.editUserStatus = async function (id, status) {
    try {
        console.log("회원번호 " + id + " 님의 상태가 " + status + " 가 되었습니다.");
        const connection = await pool.getConnection(async (conn) => conn);
        const editUserStatusResult = await userDao.updateUserStatus(connection, id, status)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUserStatus Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.deleteUserInfo = async function (id) {
    try {
        console.log("회원번호 " + id + " 님의 상태가 비활성화 되었습니다.");
        const connection = await pool.getConnection(async (conn) => conn);
        const deleteUserResult = await userDao.updateUserStatus(connection, id, 'withdrawl')
        connection.release();

        return response(baseResponse.SUCCESS);
    }
    catch (err) {
        logger.error(`App - editUserDelete Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}