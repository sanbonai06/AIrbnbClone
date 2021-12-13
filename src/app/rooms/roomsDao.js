// 모든 유저 조회
async function selectRooms(connection) {
    const selectRoomsListQuery = `
                  SELECT room_name, room_address, room_price, room_wishes, service_commission, tax_of_lodge, clean_up_cost,
                  room_description, check_in_time, check_out_time, Rooms.status, Users.user_name, Users.user_email
                  FROM Rooms, Users
                  WHERE Rooms.host_id = Users.user_id;
                  `;
    const [roomsRows] = await connection.query(selectRoomsListQuery);
    return roomsRows;
  }
  // 아이디로 호스트인지 확인
  async function selectUserStatus(connection, userId){
    const selectUserStatusQuery = `
                  SELECT status
                  FROM Users 
                  WHERE user_id = ?;
                  `;
    const [statusRows] = await connection.query(selectUserStatusQuery, userId);
    return statusRows;
  }
  
  async function selectRoomsName(connection, name){
    const selectRoomsNameQuery = `
                    SELECT room_name
                    FROM Rooms
                    WHERE room_name = ?;
                    `;
    const [nameRows] = await connection.query(selectRoomsNameQuery, name);
    return nameRows;
  }
  // userId 회원 조회
  async function selectRoomsByName(connection, name) {
    const selectRoomByNameQuery = `
                   SELECT room_name, room_address, room_price, room_wishes, service_commission, tax_of_lodge, clean_up_cost,
                   room_description, check_in_time, check_out_time, Rooms.status, Users.user_name, Users.user_email
                   FROM Users, Rooms 
                   WHERE room_name = ?
                   and Rooms.host_id = Users.user_id;
                   `;
    const [roomRow] = await connection.query(selectRoomByNameQuery, name);
    return roomRow;
  }
  /*  example
  const selectTestDB = async (connection) => {
    const selectTestDBListQuery = `
                  SELECT test_id, name
                  FROM test;
                  `;
    const [rows] = await connection.query(selectTestDBListQuery);
    console.log("dao", rows);
    return rows[0];
  };
  */
  // 유저 생성
  async function insertRoomsInfo(connection, insertRoomsInfoParams){
    const insertRoomsInfoQuery = `
          INSERT INTO Rooms(host_id, room_name, room_address, room_latitude, room_longitude, room_price, room_wishes,
            service_commission, tax_of_lodge, clean_up_cost, room_description, check_in_time, check_out_time,
            return_policy, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
    const insertRoomsInfoRow = await connection.query(
      insertRoomsInfoQuery,
      insertRoomsInfoParams
    );
  
    return insertRoomsInfoRow;
  }
  
  // 패스워드 체크
  /*async function selectUserPassword(connection, selectUserPasswordParams) {
    const selectUserPasswordQuery = `
          SELECT user_email, user_name, user_password
          FROM Users 
          WHERE user_email = ? AND user_password = ?;`;
    const selectUserPasswordRow = await connection.query(
        selectUserPasswordQuery,
        selectUserPasswordParams
    );
  
    return selectUserPasswordRow;
  }
  
  // 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
  async function selectUserAccount(connection, email) {
    const selectUserAccountQuery = `
          SELECT status, id
          FROM Users 
          WHERE user_email = ?;`;
    const selectUserAccountRow = await connection.query(
        selectUserAccountQuery,
        email
    );
    return selectUserAccountRow[0];
  }
  
  async function updateUserInfo(connection, id, user_name) {
    const updateUserQuery = `
    UPDATE Users 
    SET user_name = ?
    WHERE id = ?;`;
    const updateUserRow = await connection.query(updateUserQuery, [user_name, id]);
    return updateUserRow[0];
  }
  */
  
  module.exports = {
    selectRoomsByName,
    selectUserStatus,
    selectRooms,
    selectRoomsName,
    insertRoomsInfo,
    //selectUserPassword,
    //selectUserAccount,
    //updateUserInfo,
  };
  
  