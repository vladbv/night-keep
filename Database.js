
var USE_DB = true;

var mongojs =  USE_DB ? require('mongojs') : null;

var db = USE_DB ? mongojs('localhost:27017/myGame', ['account', 'progress']) : null;

//acount: {username: string
//progress

Database = {};

Database.isValidPassword = function(data,cb){
if(!USE_DB){

	return cb(true)
} else{

	db.account.find({username:data.username, password: data.password}, function(err, res){
		if(res){
cb(true);
		} else{
cb(false);
		}
	});
}
}

Database.isUsernameTaken = function(data,cb){
    if(!USE_DB)
        return cb(false);
	db.account.find({username:data.username},function(err,res){
		if(res)
			cb(true);
		else
			cb(false);
	});
}
Database.addUser = function(data,cb){
    if(!USE_DB)
        return cb();
	db.account.insert({username:data.username,password:data.password},function(err){
        Database.savePlayerProgress({username:data.username,items:[]},function(){
            cb();
        })
	});
}
Database.getPlayerProgress = function(username,cb){
    if(!USE_DB)
        return cb({items:[]});
	db.progress.find({username:username},function(err,res){
		cb({items:res.items});
	});
}
Database.savePlayerProgress = function(data,cb){
    cb = cb || function(){}
    if(!USE_DB)
        return cb();
    db.progress.update({username:data.username},data,{upsert:true},cb);
}
