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
    res.render('mainPage', {islogin: req.session.login});
}); 

app.get('/signIn', function(req, res){
    res.render('signIn', {islogin: req.session.login, wrong:false});
});

app.get('/bannap', function(req, res){
    res.render('bannap', {islogin: req.session.login});
});

app.get('/daechul', function(req, res){
    res.render('daechul', {islogin: req.session.login});
});

app.get('/myPage', function(req, res){
    res.render('myPage', {islogin: req.session.login});
});

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
    res.status(200);
    res.redirect('/');
});

app.post('/signUp/check',function(req, res) {
    res.status(200);

	var curUsername = req.body.id;
	if(curUsername == "") {
		res.redirect('/signUp');
	}
	else {
		user.find({ userid: curUsername }, function (err, member) {
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