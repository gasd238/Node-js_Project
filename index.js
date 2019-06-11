var express = require('express');
var app = express();
var logger = require('morgan');

app.use(logger('dev')); //로그를 남기는 미들웨어 실행
app.use(express.static('public')); //정적파일 처리 미들웨어 실행
app.use(express.urlencoded({extended:true})); //body로 넘어온 데이터 파싱

//pug 엔진 세팅
app.set('view engine', 'pug')
app.set('views', './views')

app.get('/', function(req, res){
    res.render('index');
}); 

app.listen(8080, function(){
    console.log('8080포트 머기중')
});