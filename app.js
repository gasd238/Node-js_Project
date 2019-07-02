var express = require('express')
var url = require('url')
var app = express()
var logger = require('morgan')
var userinfo = require('./model/mongo');
var session = require('express-session');
var favicon = require('serve-favicon')

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
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.get('/', function(req, res){
    res.render('mainPage', {islogin: req.session.login, grade: req.session.grade});
}); 

app.get('/signIn', function(req, res){
    res.render('signIn');
});

app.get('/bannap', function(req, res){
    res.render('bannap', {islogin: req.session.login, grade: req.session.grade});
});

app.get('/daechul', function(req, res){
    res.render('daechul', {islogin: req.session.login, grade: req.session.grade});
});

app.get('/myPage', function(req, res){
    res.render('myPage', {islogin: req.session.login, grade: req.session.grade, name: req.session.username, num: req.session.number, isok: req.session.isok, bookli: req.session.bookli});
});

app.get('/admin', function(req, res){
	res.render('admin', {islogin: req.session.login, grade: req.session.grade, bookli: req.session.bookli});
})

app.get('/wrong', function(req, res){
	res.render('wrong')
})

app.get('/wrong2', function(req, res){
	res.render('wrongID')
})

app.get('/signUp', function (req, res, next) {
	res.render('signUp');
});

app.post('/signIn/check', function(req, res, next) { 
	dbo.collection("userinfo").find({userid: req.body.id, pw: req.body.password}).toArray(function(err, member) {
		if( member.length )	 {
			req.session.login = 'login';
			req.session.username = member[0].name;
			req.session.grade = member[0].grade;
			req.session.number = member[0].number;
			req.session.isok = member[0].isok;
			req.session.bookli = member[0].bookli;
            res.status(200);
		    res.redirect('/');
		} else{
			res.redirect('/wrong');
		}
	});
});

app.get('/logOut', function(req, res){
	req.session.login = 'logout';
	req.session.grade = 'undefined';
	req.session.number = NaN;
	req.session.isok = '?'
	req.session.bookli = {}
    res.status(200);
    res.redirect('/');
});

app.post('/signUp/check',function(req, res) {
	var user = new Object();
	user.userid = req.body.id;
	user.pw = req.body.password;
	user.name = req.body.name;
	user.number = req.body.number;
	user.isok = 'O';
	user.grade = 'user';
	user.bookli = {bookinfo:{bookname:[], leftdays:[]}}
	dbo.collection("userinfo").find({userid: req.body.id}).toArray(function(err, member){
		console.log(member)
		if( !member.length )	 {
			dbo.collection('userinfo').insert(user);
			res.redirect('/')
		} else{
			res.redirect('/wrong2');
		}
	});
});

app.listen(8080, function(){
    console.log('8080포트 머기중')
});