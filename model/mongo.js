var mongoose = require('mongoose'); 
var Schema = mongoose.Schema; 
var userSchema = new Schema({ 
    id: String, 
    password: String, 
    name: String, 
    grade: String,
    number: Number ,
    isok : String,
    bookli: {
        bookinfo : {
            bookname: [],
            leftdays: []
        }
    }
}); 

module.exports = mongoose.model('userinfo', userSchema);