var express = require('express')
var url = require('url')
var app = express()
var logger = require('morgan')
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
    res.render('signIn');
});

app.get('/bannap', function(req, res){
    res.render('bannap', {islogin: req.session.login, grade: req.session.grade});
});

app.get('/daechul', function(req, res){
	res.render('daechul', {islogin: req.session.login, grade: req.session.grade, isok: req.session.isok});
});

app.get('/myPage', function(req, res){
	dbo.collection("landedbooks").find({landuser: req.session.userid}).toArray(function(err, member){
		if(member.length){
			req.session.bookli = member;
		}else{
			req.session.bookli = [];
		}
		res.render('myPage', {islogin: req.session.login, grade: req.session.grade, name: req.session.username, num: req.session.number, isok: req.session.isok, bookli: req.session.bookli});
	});
});

app.get('/admin', function(req, res){
	dbo.collection("returnedbooks").find({}).toArray(function(err, rbooks){
		dbo.collection("landedbooks").find({}).toArray(function(err, books){
			res.render('admin', {islogin: req.session.login, grade: req.session.grade, rbookli: rbooks, bookli: books});
		})
	});
});

app.get('/wrong', function(req, res){
	res.render('wrong')
})

app.get('/wrong2', function(req, res){
	res.render('wrong2')
})

app.get('/signUp', function (req, res) {
	res.render('signUp');
});

app.get('/admin_member', function(req, res){
	dbo.collection("userinfo").find({}).toArray(function(err, member){
		res.render('member', {islogin: req.session.login, grade: req.session.grade, member: member});
	});
});

app.post('/signIn/check', function(req, res) { 
	dbo.collection("userinfo").find({userid: req.body.id, pw: req.body.password}).toArray(function(err, member) {
		if( member.length )	 {
			req.session.userid = member[0].userid;
			req.session.login = 'login';
			req.session.username = member[0].name;
			req.session.grade = member[0].grade;
			req.session.number = member[0].number;
			req.session.isok = member[0].isok;
            res.status(200);
		    res.redirect('/');
		} else{
			res.redirect('/wrong');
		}
	});
});

app.get('/logOut', function(req, res){
	req.session.userid = "undefined"
	req.session.login = 'logout';
	req.session.grade = 'undefined';
	req.session.number = NaN;
	req.session.isok = '?'
	req.session.bookli = []
    res.status(200);
    res.redirect('/');
});

app.post('/signUp/check',function(req, res) {
	var user = new Object();
	user.userid = req.body.id;
	user.pw = req.body.password;
	user.name = req.body.name;
	user.grade = 'user';
	user.number = req.body.number;
	user.isok = 'O';
	dbo.collection("userinfo").find({userid: req.body.id}).toArray(function(err, member){
		if( !member.length )	 {
			dbo.collection('userinfo').insert(user);
			res.render('success')
		} else{
			res.redirect('/wrong2');
		}
	});
});

app.post('/add', function(req, res){
	var date = new Date();
	var landdate = String(date.getFullYear()) + '/' + String(date.getMonth() + 1) + '/' + String(date.getDay());
	var book = {bookcode : req.body.code, landdate: landdate, landuser: req.session.userid};
	dbo.collection("landedbooks").insertOne(book);
	res.render('addsuccess')
});

app.post('/member_mod', function(req, res){
	dbo.collection("userinfo").find({name: req.body.name}).toArray(function(err, member){
		req.body.isok = (req.body.isok).toUpperCase();
		if(req.body.isok === 'O' || req.body.isok === 'X'){
			member[0].isok = req.body.isok;
			dbo.collection("userinfo").update({name: req.body.name}, {userid: member[0].userid, pw: member[0].pw, name: member[0].name, grade: member[0].grade, number: member[0].number, isok: member[0].isok});
			res.redirect('/admin_member')
		} else{
			res.render('noother')
		}
	});
});

app.post('/page', function(req,res){
	dbo.collection("userinfo").find({name: req.body.name}).toArray(function(err, member){
		dbo.collection("landedbooks").find({landuser: member[0].userid}).toArray(function(err, books){
			res.render('whospage', {islogin: req.session.login, grade: req.session.grade, name: member[0].name, num: member[0].number, isok: member[0].isok, bookli: books});
		});
	});
});

app.post('/return', function(req, res){
	var date = new Date();
	var returndate = String(date.getFullYear()) + '/' + String(date.getMonth() + 1) + '/' + String(date.getDay());
	dbo.collection("returnedbooks").insertOne({bookcode: req.body.code, landuser: req.session.userid, returndate : returndate});
	dbo.collection("landedbooks").remove({bookcode: req.body.code, landuser: req.session.userid});
	res.render('returnsuccess')
});

app.post('/return_check', function(req, res){
	dbo.collection("returnedbooks").remove({bookcode: req.body.code});
	res.render('returnchecksuccess')
})

app.listen(8080, function(){
    console.log('8080포트 머기중')
});