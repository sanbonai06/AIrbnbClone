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
                SELECT user_email, user_sex, user_name, user_phone_number, status
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


module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  updateUserInfo,
};

