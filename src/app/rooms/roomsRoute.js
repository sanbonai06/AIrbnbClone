module.exports = function(app){
    const rooms = require('./roomsController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    // 1. 방 생성 API
    app.post('/app/rooms', jwtMiddleware,  rooms.postrooms);

    // 2. 방 조회 API (+ 검색)
    app.get('/app/rooms',rooms.getRooms); 

    // 3. 호스트 정보로 방 조회 API
    app.get('/app/rooms/:hostId', rooms.getRoomsByHostId);

    // 4. 방 식별번호로 방 조회 API
    app.get('/app/rooms/:roomsId', rooms.getRoomsByRoomsId);

    // 5. 방 정보 수정 API
    app.patch('/app/rooms/:roomsId/:option', jwtMiddleware, rooms.patchRooms);

    // 6. 방 정보 삭제 API
    app.patch('/app/rooms', jwtMiddleware, rooms.deleteRoomsInfo);
 };


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, room.check);


// TODO: 탈퇴하기 API