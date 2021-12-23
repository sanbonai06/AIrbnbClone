const jwtMiddleware = require('../../../config/jwtMiddleware');

module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const session = require('express-session');

    app.use(session({
        secret:'minjoon',
        resave:true,
        secure:false,
        saveUninitialized:false,
    }))

    // 1. 유저 생성 (회원가입) API
    app.post('/app/users', user.postUsers);

    // 2. 유저 조회 API (+ 검색)
    app.get('/app/users',user.getUsers); 

    // 3. 특정 유저 조회 API
    app.get('/app/users/:userId', user.getUserById);

    // 4. 유저 예약 API
    app.post('/app/reservation/:userId', jwtMiddleware ,user.postReservation);

    // TODO: After 로그인 인증 방법 (JWT)
    // 5. 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);

    //6. 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    app.patch('/app/users/option/:option', jwtMiddleware, user.patchUsers);
    
    // 7. 회원 상태 수정 API (호스트, 유저, 슈퍼 호스트, withdrawl)
    app.patch('/app/users/status', jwtMiddleware, user.patchUsersStatus);

    // TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
    // 8. 자동로그인 API
    app.get('/app/auto-login', jwtMiddleware, user.check);

    // 9. 탈퇴하기 API
    app.patch('/app/users', jwtMiddleware, user.delete);

    // 10. 리뷰작성 API
    app.post('/app/review/:userId/:roomId', jwtMiddleware, user.postReview);

    // 11. 리뷰수정 API
    app.patch('/app/review/:userId/:reviewId', jwtMiddleware, user.updateReview);

    // 12. 리뷰삭제 API
    app.patch('/app/review/delete/:userId/:reviewId', jwtMiddleware, user.deleteReview);

    // 13. 예약 취소 API
    app.patch('/app/reservation/cancle/:userId/:reservationId', jwtMiddleware, user.deleteReservation);

    // 14. 위시리스트 생성 API
    app.post('/app/wishlist/:userId/:roomId', jwtMiddleware, user.createWishlist);

    // 15. 위시리스트 조회 API
    app.get('/app/wishlist/:userId/:wishlistId', jwtMiddleware, user.showWishlist);

    // 16. 위시리스트 수정 API
    app.patch('/app/wishlist/:userId/:wishlistId', jwtMiddleware, user.updateWishlist);

    // 17. 예약 내역 조회 APi
    app.get('/app/reservation/:userId/:reservationId', jwtMiddleware, user.getReservation);

    // 18. 별점 평가 API
    app.post('/app/rank/:userId/:roomId', jwtMiddleware, user.postRank);

    // 19. 소셜 로그인 API
    app.get('/app/login/kakao', user.kakaoLogin);
    app.post('/app/login/kakao',user.kakaoLoginGetUserInfo);
};




