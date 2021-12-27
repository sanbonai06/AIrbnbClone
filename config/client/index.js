import axios from 'axios';

function onClickButton() {
    alert("Hello World");
}

function button_click() {
    axios({
        method:'GET',
        url: 'http://localhost:3000/app/test',
        data: {}
    })
    .then(response => {
        console.log("성공");
    })
    .catch(error => {
        console.log("실패");
    })
}