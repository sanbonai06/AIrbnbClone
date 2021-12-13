module.exports = function(app){
    const rooms = require('./roomsController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    // 1. 방 생성 API
    app.post('/app/rooms', rooms.postrooms);

    // 2. 방 조회 API (+ 검색)
    app.get('/app/rooms',rooms.getrooms); 

 };


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, room.check);

// TODO: 탈퇴하기 API