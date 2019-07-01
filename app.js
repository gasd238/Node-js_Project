var express = require('express')
var engine = require('ejs')
var url = require('url')
var app = express()
var logger = require('morgan')
var user = require('./model/mongo');
var mongoose = require('mongoose')
var expressSession = require('express-session');

app.use(logger('dev')); //로그를 남기는 미들웨어 실행
app.use(express.static('public')); //정적파일 처리 미들웨어 실행
app.use(express.urlencoded({extended:true})); //body로 넘어온 데이터 파싱

app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized:true
}));

var db = mongoose.connect('mongodb://localhost/gsmlibrary');

var createSession = function createSession(){
    return function(req, res, next){
      if(!req.session.login){
        req.session.login = 'logout';
      }
      next();
    };
};

//pug 엔진 세팅
app.set('views', './views')
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('views'));

app.get('/', function(req, res){
    res.render('mainPage.html');
}); 

app.get('/signIn', function(req, res){
    res.render('signIn.html');
});

app.get('/bannap', function(req, res){
    res.render('bannap.html');
});

app.get('/daechul', function(req, res){
    res.render('daechul.html');
});

app.get('/myPage', function(req, res){
    res.render('myPage.html');
});

app.post('/signUp', function (req, res, next) {

});

app.post('/signIn', function(req, res, next) { 
    res.status(200);
    user.findOne({ username: req.username, password: req.password }, function (err, member) {
        console.log(member)
		if(member != null) {
			req.session.login = 'login';
			req.session.username = req.username;
		};
		res.status(200);
		res.redirect('/');
	});
});

app.post('/logOut', function(req, res){
    req.session.login = 'logout';
    res.status(200);
    res.redirect('/');
});

app.post('/signUp',function(req, res) {
    res.status(200);

	var curUsername = req.username;
	if(curUsername == "") {
		res.redirect('/');
	}
	else {
		user.findOne({ username: curUsername }, function (err, member) {
	  		if (err) return handleError(err);
	  		
	  		if(member == null) { // new username
	  			// add myMember into the model
				var myMember = new Member({ username: curUsername, password: req.password});
				myMember.save(function (err, data) {
					if (err) {
						console.log("error");
				    }
                    console.log('member is inserted');
                    res.redirect('/');
				});
	  		}
	  		else {
                res.redirect('/signUp');
	  		}
		});
	}
});

app.listen(8080, function(){
    console.log('8080포트 머기중')
});