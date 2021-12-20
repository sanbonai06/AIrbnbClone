const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (user_email) {
  if (!user_email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, user_email);
    connection.release();

    return userListResult;
  }
};

exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0];
};

exports.user_emailCheck = async function (user_email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const user_emailCheckResult = await userDao.selectUserEmail(connection, user_email);
  connection.release();

  return user_emailCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

exports.accountCheck = async function (user_email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, user_email);
  connection.release();

  return userAccountResult;
};
exports.testMySQL = async () => {
  const connection = await pool.getConnection(async (conn) => conn); //pool로 부터 커넥션을 얻고
  const testResult = await userDao.selectTestDB(connection); //해당 커넥션으로 무언갈 함
  console.log("provider", testResult);
  connection.release(); //커넥션 해제
  return testResult;
};

exports.getReview = async (reviewId) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const reviewRow = await userDao.getReview(connection, reviewId);
  connection.release();

  return reviewRow[0];
}

exports.getReservation = async (id) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const reservationRow = await userDao.getReservation(connection, id);
  connection.release();

  return reservationRow[0];
}

exports.retrieveWishlist = async (id, name) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const getWishlistRow = await userDao.getWishlist(connection, id, name);
  connection.release();

  return getWishlistRow;
}

exports.retrieveWish = async (roomId, wishlistId) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const getWishRow = await userDao.getWish(connection, roomId, wishlistId);
  connection.release();

  return getWishRow[0];
}

exports.retrieveWishlistInfo = async (wishlistId) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveWishlistRow = await userDao.selectWishlist(connection, wishlistId);
  connection.release();

  return retrieveWishlistRow;
}