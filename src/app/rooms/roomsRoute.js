module.exports = function(app){
    const rooms = require('./roomsController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    // 1. 방 생성 API
    app.post('/app/rooms', jwtMiddleware,  rooms.postrooms);

    // 2. 방 조회 API (+ 검색)
    app.get('/app/rooms',rooms.getRooms); 

    // 3. 호스트 정보로 방 조회 API
    app.get('/app/rooms/hostId/:hostId', rooms.getRoomsByHostId);

    // 4. 방 식별번호로 방 조회 API
    app.get('/app/rooms/roomsId/:roomsId', rooms.getRoomsByRoomsId);

    // 5. 방 정보 수정 API
    app.patch('/app/rooms/:roomsId/:option', jwtMiddleware, rooms.patchRooms);

    // 6. 방 정보 삭제 API
    app.patch('/app/rooms/:roomsId', jwtMiddleware, rooms.deleteRoomsInfo);
    
    // 7. 방 사진 추가 API
    app.post('/app/rooms/images/:roomsId', jwtMiddleware, rooms.postImage);

    // 8. 방 사진 삭제 API
    app.patch('/app/rooms/image/:roomsId', jwtMiddleware, rooms.deleteImage);

    // 9. 지역과 날짜로 방 검색 API
    app.get('/app/rooms/:location/:checkInDate/:checkOutDate', rooms.serchRooms);
 };


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, room.check);


// TODO: 탈퇴하기 API