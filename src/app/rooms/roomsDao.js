// 모든 방 조회
async function selectRooms(connection) {
    const selectRoomsListQuery = ` 
                  SELECT room_name, room_address, room_price, room_wishes, service_commission, tax_of_lodge, clean_up_cost,
                  room_description, check_in_time, check_out_time, Evaluation.total, Rooms.status, Users.user_name, Users.user_email
                  FROM Rooms, Evaluation, Users
                  WHERE Rooms.host_id = Users.user_id and Evaluation.room_id = Rooms.room_id;
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
                   room_description, check_in_time, check_out_time, Evaluation.total, Rooms.status, Users.user_name, Users.user_email
                   FROM Users, Evaluation, Rooms 
                   WHERE room_name = ?
                   and Rooms.host_id = Users.user_id
                   and Evaluation.room_id = Rooms.room_id;
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
  
  async function selectRoomsByHostID(connection, hostId) {
    const selectRoomsByHostIdQuery = `
          SELECT  room_name, room_address, room_price, room_wishes, service_commission, tax_of_lodge, clean_up_cost,
          room_description, check_in_time, check_out_time, Evaluation.total, Rooms.status, Users.user_name, Users.user_email
          FROM Users, Evaluation, Rooms
          WHERE Rooms.host_id = ? and Users.user_id = Rooms.host_id
          and Evaluation.room_id = Rooms.room_id; 
          `;
        const selectRoomsRow = await connection.query(
          selectRoomsByHostIdQuery,
          hostId
        );
      
      return selectRoomsRow;
  }

  async function selectRoomsByRoomsId(connection, roomsId) {

    const selectRoomsInfoQuery = `
          SELECT  room_name, room_address, room_price, room_wishes, service_commission, tax_of_lodge, clean_up_cost,
          room_description, check_in_time, check_out_time, Evaluation.total, Rooms.status, Users.user_name, Users.user_email, Rooms.host_id
          FROM Users, Evaluation, Rooms
          WHERE Rooms.room_id = ? and Evaluation.room_id = Rooms.room_id
          and Users.user_id = Rooms.host_id; `;
          
          const selectRoomsRow = await connection.query(
            selectRoomsInfoQuery,
            roomsId
          );
        return selectRoomsRow[0];

  }

  async function updateRoomsName(connection, id, name) {
    const updateRoomQuery = `
    UPDATE Rooms 
    SET room_name = ?
    WHERE room_id = ?;`;
    const updateRoomRow = await connection.query(updateRoomQuery, [name, id]);
    return updateRoomRow[0];
  }
  
  async function updateRoomsAddr(connection, id, addr) {
    const updateRoomQuery = `
    UPDATE Rooms 
    SET room_address = ?
    WHERE room_id = ?;`;
    const updateRoomRow = await connection.query(updateRoomQuery, [addr, id]);
    return updateRoomRow[0];
  }
  
  async function updateRoomsPrice(connection, id, price) {
    const updateRoomQuery = `
    UPDATE Rooms 
    SET room_price = ?
    WHERE room_id = ?;`;
    const updateRoomRow = await connection.query(updateRoomQuery, [price, id]);
    return updateRoomRow[0];
  }
  
  async function updateRoomsCommission(connection, id, commission) {
    const updateRoomQuery = `
    UPDATE Rooms 
    SET room_commission = ?
    WHERE room_id = ?;`;
    const updateRoomRow = await connection.query(updateRoomQuery, [commission, id]);
    return updateRoomRow[0];
  }
  
  async function updateRoomsCleanCost(connection, id, cleanCost) {
    const updateRoomQuery = `
    UPDATE Rooms 
    SET clean_up_cost = ?
    WHERE room_id = ?;`;
    const updateRoomRow = await connection.query(updateRoomQuery, [cleanCost, id]);
    return updateRoomRow[0];
  }
  
  async function updateRoomsDescription(connection, id, descript) {
    const updateRoomQuery = `
    UPDATE Rooms 
    SET room_description = ?
    WHERE room_id = ?;`;
    const updateRoomRow = await connection.query(updateRoomQuery, [descript, id]);
    return updateRoomRow[0];
  }
  
  async function updateRoomsStatus(connection, id, status) {
    const updateUserQuery = `
    UPDATE Rooms 
    SET status = ?
    WHERE room_id = ?;`;
    const updateRoomRow = await connection.query(updateUserQuery, [status, id]);
    return updateRoomRow[0];
  }
  
  async function deleteRooms(connection, id) {
    const deleteRoomQuery = `
    UPDATE Rooms
    SET status = 'closed'
    WHERE room_id = ?;
    `;
    const deleteRoomRow = await connection.query(deleteRoomQuery, id);
    return deleteRoomRow;
  }

  async function postImage(connection, insertParams) {
    const postImageQuery =`
    INSERT INTO room_images(room_id, image_name, path, status)
    VALUES (?, ?, ?, 'exist');
    `;
    const postImageRow = await connection.query(postImageQuery, insertParams);
    return postImageRow;
  }

  async function selectRoomsImageByimageUrl(connection, url) {
    const getImageIdQuery = `
    SELECT images_id
    FROM room_images
    WHERE path = ?;
    `;
    const getImageRow = await connection.query(getImageIdQuery, url);
    return getImageRow;
  }

  async function deleteImage(connection, id) {
    const deleteImageQuery = `
    UPDATE room_images
    SET status = 'non-existent'
    WHERE images_id = ?;
    `;
    const deleteImageRow = await connection.query(deleteImageQuery, id);
    return deleteImageRow;
  }

  async function selectRoomsByFilter(connection, location) {
    const selectRoomsByFilterQuery = `
    SELECT Rooms.room_id, Reservation.check_in_date, Reservation.check_out_date
    FROM Rooms, Reservation
    WHERE Rooms.location = ? and Reservation.room_id = Rooms.room_id;
    `;
    const [selectRoomsRow] = await connection.query(selectRoomsByFilterQuery, location);
    return selectRoomsRow;
  }

  async function sortRooms(connection, serchRoomsIdParams) {
    const sortRoomsQuery = `
    SELECT Rooms.room_name, Rooms.room_address, Rooms.room_latitude, Rooms.room_longitude, Rooms.room_price, Rooms.Max_people,
    Evaluation.total AS "별점", room_options.item1 AS "침실", room_options.item2 AS "침대", room_options.item3 AS "화장실"
    
    FROM Rooms, Evaluation, room_options
    WHERE Rooms.room_id REGEXP ? and Evaluation.room_id = Rooms.room_id and room_options.room_option_id = Rooms.room_option_id;
    `;
    const [sortRoomsRow] = await connection.query(sortRoomsQuery, serchRoomsIdParams);
    console.log(sortRoomsRow);
    return sortRoomsRow;
  }
  module.exports = {
    selectRoomsByName,
    selectUserStatus,
    selectRooms,
    selectRoomsName,
    insertRoomsInfo,
    selectRoomsByHostID,
    selectRoomsByRoomsId,
    updateRoomsName,
    updateRoomsAddr,
    updateRoomsPrice,
    updateRoomsCommission,
    updateRoomsCleanCost,
    updateRoomsDescription,
    updateRoomsStatus,
    deleteRooms,
    postImage,
    selectRoomsImageByimageUrl,
    deleteImage,
    selectRoomsByFilter,
    sortRooms
    //selectUserAccount,
    //updateUserInfo,
  };
  
  