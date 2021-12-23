const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const roomsDao = require("./roomsDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveRoomsList = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const roomsListResult = await roomsDao.selectRooms(connection);
    connection.release();

    return roomsListResult;

};
exports.retrieveRoom = async function (name) {
  const connection = await pool.getConnection(async (conn) => conn);
  const roomResult = await roomsDao.selectRoomsByName(connection, name);

  connection.release();

  return roomResult[0];
};

exports.hostIdCheck = async function (hostId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const hostIdCheckResult = await roomsDao.selectUserStatus(connection, hostId);
  connection.release();

  return hostIdCheckResult;
};

exports.nameCheck = async function (name) {
    const connection = await pool.getConnection(async (conn) => conn);
    const nameCheckResult = await roomsDao.selectRoomsName(connection, name);
    connection.release();

    return nameCheckResult;
};

exports.getRoomsByHostId = async function (hostId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getRooms = await roomsDao.selectRoomsByHostID(connection, hostId);
    connection.release();

    return getRooms;
}

exports.getRoomsByRoomsId = async function (roomsId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getRoomInfo = await roomsDao.selectRoomsByRoomsId(connection, roomsId);
  connection.release();
  return getRoomInfo;
}

exports.getRoomsImageByimageUrl = async function (Url) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getRoomImage = await roomsDao.selectRoomsImageByimageUrl(connection, Url);
  connection.release();

  return getRoomImage[0];
}

exports.getRoomsByLocation = async function (location) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getRoomsRow = await roomsDao.selectRoomsByLocation(connection, location);
  connection.release();

  return getRoomsRow;
}