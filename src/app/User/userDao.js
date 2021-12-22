// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT user_email, user_sex, user_name, user_phone_number, status 
                FROM Users;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 이메일로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
                SELECT user_id, user_email, user_sex, user_name, user_phone_number, status
                FROM Users 
                WHERE user_email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);
  return emailRows;
}

// userId 회원 조회
async function selectUserId(connection, userId) {
  const selectUserIdQuery = `
                 SELECT user_id, user_email, user_name, status 
                 FROM Users 
                 WHERE user_id = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}

async function insertReservationInfo(connection, insertReservationParams) {
  const insertReservationQuery = `
                  INSERT INTO Reservation(user_id, room_id, adults, childeren, infants, pets, check_in_date, check_out_date, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'exist');
                  `;
  const insertReservationInfoRow = await connection.query(
    insertReservationQuery,
    insertReservationParams
  );
  return insertReservationInfoRow;           
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
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO Users(user_email, user_password, user_name, user_sex, user_phone_number, user_birth, status)
        VALUES (?,  ?, ?, ?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT user_password
        FROM Users 
        WHERE user_email = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
        SELECT status, user_id
        FROM Users 
        WHERE user_email = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      email
  );
  return selectUserAccountRow[0];
}

async function updateUserName(connection, id, user_name) {
  const updateUserQuery = `
  UPDATE Users 
  SET user_name = ?
  WHERE user_id = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [user_name, id]);
  return updateUserRow[0];
}

async function updateUserSex(connection, id, sex) {
  const updateUserQuery = `
  UPDATE Users 
  SET user_sex = ?
  WHERE user_id = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [sex, id]);
  return updateUserRow[0];
}
async function updateUserBirth(connection, id, birth) {
  const updateUserQuery = `
  UPDATE Users 
  SET user_birth = ?
  WHERE user_id = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [birth, id]);
  return updateUserRow[0];
}
async function updateUserEmail(connection, id, email) {
  const updateUserQuery = `
  UPDATE Users 
  SET user_email = ?
  WHERE user_id = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [email, id]);
  return updateUserRow[0];
}
async function updateUserPhoneNum(connection, id, phoneNum) {
  const updateUserQuery = `
  UPDATE Users 
  SET user_phone_number = ?
  WHERE user_id = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [phoneNum, id]);
  return updateUserRow[0];
}
async function updateUserStatus(connection, id, status) {
  const updateUserQuery = `
  UPDATE Users 
  SET status = ?
  WHERE user_id = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [status, id]);
  return updateUserRow[0];
}

async function getReservationInformation(connection, userId, roomId) {
  const getReservationInfoQuery = `
  SELECT room_id
  FROM Reservation
  WHERE user_id = ? and room_id = ?;
  `;
  const getReservationInfoRow = await connection.query(getReservationInfoQuery, [userId,roomId]);
  return getReservationInfoRow;
}

async function postReview(connection, insertParams) {
  const postReviewQuery = `
  INSERT INTO Reviews(user_id, room_id, text, status)
                  VALUES (?, ?, ?, 'exist');
                  `;
  ;
  const postReviewRow = await connection.query(postReviewQuery, insertParams);
  return postReviewRow[0];
}

async function getReview(connection, reviewId) {
  const getReviewQuery =`
  SELECT user_id, status
  FROM Reviews
  WHERE review_id = ?;
  `;
  const getReviewRow = await connection.query(getReviewQuery, reviewId);
  return getReviewRow;
} 

async function updateReview(connection, reviewId, text) {
  const updateReviewQuery = `
  UPDATE Reviews
  SET text = ?
  WHERE review_id = ?;
  `;
  const updateReviewRow = await connection.query(updateReviewQuery, [text, reviewId]);
  return updateReviewRow;
}

async function deleteReview(connection, reviewId) {
  const deleteReviewQuery = `
  UPDATE Reviews
  SET Status = 'non-existent'
  WHERE review_id = ?;
  `;
  const deleteReviewRow = await connection.query(deleteReviewQuery, reviewId);
  return deleteReviewRow;
}

async function getReservation(connection, id) {
  const getReservationQuery = `
  SELECT user_id
  FROM Reservation
  WHERE reservation_id = ?;
  `;
  const getReservationRow = await connection.query(getReservationQuery, id);
  return getReservationRow;
}

async function deleteReservation(connection, id) {
  const deleteReservationQuery = `
  UPDATE Reservation
  SET status = 'non-existent'
  WHERE reservation_id = ?;
  `;
  const deleteReservationRow = await connection.query(deleteReservationQuery, id);
  return deleteReservationRow;
}

async function createWishlist(connection, insertParams) {
  const createWishlistQuery = `
  INSERT INTO wishlist(wishlist_name, user_id, status)
  VALUES (?, ?, 'exist');
  `;
  const createWishlistRow = await connection.query(createWishlistQuery, insertParams);
  return createWishlistRow;
}

async function getWishlist(connection, id, name) {
  const getWishlistQuery = `
  SELECT wishlist_id
  FROM wishlist
  WHERE user_id = ? and wishlist_name = ?;
  `;
  const [getWishlistRow] = await connection.query(getWishlistQuery, [id, name]);
  return getWishlistRow;
}

async function addWish(connection, insertParams) {
  const addWishQuery = `
  INSERT INTO wish_middle(room_id, wishlist_id, status)
  VALUE (?, ?, 'exist');
  `;
  const addWishRow = await connection.query(addWishQuery, insertParams);
  return addWishRow;
}

async function getWish(connection, roomId, wishlistId) {
  const getWishQuery = `
  SELECT wish_add_id
  FROM wish_middle
  WHERE room_id = ? and wishlist_id = ? and status = 'exist';
  `;
  const getWishRow = await connection.query(getWishQuery, [roomId, wishlistId]);
  return getWishRow;
}

async function selectWishlist(connection, wishlistId) {
  const selectWishlistQuery = `
  SELECT wishlist.wishlist_id, wishlist.wishlist_name, wish_middle.room_id, 
        Rooms.room_name, Rooms.room_address, Rooms.room_price, room_options.item1,
        room_options.item2, room_options.item3, room_images.path
  FROM wishlist, wish_middle, Rooms, room_options, room_images
  WHERE wishlist.wishlist_id = ? and wish_middle.wishlist_id = wishlist.wishlist_id and Rooms.room_id = wish_middle.room_id
        and room_options.room_option_id = Rooms.room_option_id and room_images.room_id = Rooms.room_id
  `;
  const [selectWishlistRow] = await connection.query(selectWishlistQuery, wishlistId);
  return selectWishlistRow;
}

async function selectReservation(connection, Id) {
  const selectReservationQuery = `
  SELECT room_images.path, Reservation.check_in_date  , Reservation.check_out_date,
   sum(Reservation.adults + Reservation.childeren) AS "총 인원 수", Reservation.reservation_id, Rooms.return_policy,
   Rooms.room_address, Rooms.room_price*Reservation.days AS "총 숙박비"
   FROM room_images, Reservation, Rooms
   WHERE Reservation.reservation_id = ? and Rooms.room_id = Reservation.room_id and room_images.room_id = Rooms.room_id;
   `;
   const [selectReservationRow] = await connection.query(selectReservationQuery, Id);
   return selectReservationRow;
}

async function updateWishlistName(connection, Id, val) {
  const updateWishlistNameQuery = `
  UPDATE wishlist
  SET wishlist_name = ?
  WHERE wishlist_id = ?;
  `;
  const updateWishlistNameRow = await connection.query(updateWishlistNameQuery, [val, Id]);
  return updateWishlistNameRow;
}

async function updateWishlistInfo(connection, Id, val) {
  const updateWishlistInfoQuery = `
  UPDATE wish_middle
  SET status = 'non-existent'
  WHERE wishlist_id = ? and room_id = ?;
  `;
  const updateWishlistInfoRow = await connection.query(updateWishlistInfoQuery, [Id, val]);
  return updateWishlistInfoRow;
}

async function postRank(connection, insertParams) {
  const postRankQuery = `
  UPDATE Evaluation
  SET item1 = ?, item2 = ?, item3 = ?, item4 = ?, item5 = ?, item6 = ?, total = ?
  WHERE room_id = ?;
  `;
  const postRankRow = await connection.query(postRankQuery, insertParams);
  return postRankRow;
}

async function selectRank(connection, Id) {
  const selectRankQuery = `
  SELECT item1, item2, item3, item4, item5, item6, total
  FROM Evaluation
  WHERE Evaluation.room_id = ?;
  `;
  const [selectRankRow] = await connection.query(selectRankQuery, Id);
  return selectRankRow;
}

async function createEvaluation(connection, insertParams) {
  const createEvaluationQuery = `
  INSERT INTO Evaluation(item1, item2, item3, item4, item5, item6, total, room_id, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'exist');
  `;
  const createEvaluationRow = await connection.query(createEvaluationQuery, insertParams);
  return createEvaluationRow;
}
module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  updateUserName,
  updateUserSex,
  updateUserBirth,
  updateUserEmail,
  updateUserPhoneNum,
  updateUserStatus,
  insertReservationInfo,
  getReservationInformation,
  postReview,
  getReview,
  updateReview,
  deleteReview,
  getReservation,
  deleteReservation,
  createWishlist,
  getWishlist,
  addWish,
  getWish,
  selectWishlist,
  selectReservation,
  updateWishlistName,
  updateWishlistInfo,
  postRank,
  selectRank,
  createEvaluation
};

