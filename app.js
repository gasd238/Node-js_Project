var express = require('express')
var engine = require('ejs')
var url = require('url')
var app = express()
var logger = require('morgan')
var user = require('./model/mongo');
var session = require('express-session');

app.use(logger('dev')); //로그를 남기는 미들웨어 실행
app.use(express.static('public')); //정적파일 처리 미들웨어 실행
app.use(express.urlencoded({extended:true})); //body로 넘어온 데이터 파싱


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var dbo;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  dbo = db.db("gsmlibrary");
}); 

var createSession = function createSession(){
    return function(req, res, next){
      if(!req.session.login){
        req.session.login = 'logout';
      }
      next();
    };
};

app.use(session({
	secret: 'asdhfoiaheifo',
	resave: true,
	saveUninitialized: true
   }));

//pug 엔진 세팅
app.set('views', './views')
app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(createSession());

app.get('/', function(req, res){
    res.render('mainPage', {islogin: req.session.login, grade: req.session.grade});
}); 

app.get('/signIn', function(req, res){
    res.render('signIn', {islogin: req.session.login, grade: req.session.grade});
});

app.get('/bannap', function(req, res){
    res.render('bannap', {islogin: req.session.login, grade: req.session.grade});
});

app.get('/daechul', function(req, res){
    res.render('daechul', {islogin: req.session.login, grade: req.session.grade});
});

app.get('/myPage', function(req, res){
    res.render('myPage', {islogin: req.session.login, grade: req.session.grade});
});

app.get('/admin', function(req, res){
	res.render('admin', {islogin: req.session.login, grade: req.session.grade});
})

app.get('/wrong', function(req, res){
	res.render('wrong')
})

app.post('/signUp', function (req, res, next) {

});

app.post('/signIn/check', function(req, res, next) { 
	dbo.collection("userinfo").find({userid: req.body.id, pw: req.body.password}).toArray(function(err, member) {
		if( member.length )	 {
			req.session.login = 'login';
			req.session.username = req.body.id;
			req.session.grade = member[0].grade;
            res.status(200);
		    res.redirect('/');
		} else{
			res.redirect('/wrong');
		}
	});
});

app.get('/logOut', function(req, res){
	req.session.login = 'logout';
	req.session.grade = 'undefined'
    res.status(200);
    res.redirect('/');
});

app.post('/signUp/check',function(req, res) {

	var curUsername = req.body.id;
	if(curUsername == undefined) {
		res.redirect('/signUp');
	}
	else {
		user.find({ userid: curUsername }, function (err, member) {
	  		if (err) return handleError(err);
	  		
	  		if(!member.length) {
				var myMember = new Member({ userid: curUsername, pw: req.body.password, name: req.body.name});
				myMember.save(function (err, data) {
					if (err) {
						console.log("error");
				    }
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