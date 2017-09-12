var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var Sync = require('sync');
var session = require('express-session')
var sha1 = require('sha1');
require(__dirname + '/db.js');



var app =express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret:'sdfsdf1234566	'}));

app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);

app.get('/',function(req, res){
    res.send('hello world');
});

app.get('/registration',function(req,res){    
    res.render(__dirname + '/registration.html');
});

return_data=[];

var insert=function($field, callback){
	connection.query("INSERT INTO test4 SET ?",$field,function(err,result1){  
		if(result1.affectedRows==1){
			return_data['regis_status']='Ok';
			return_data['message']='Registration Successful.';    			
			callback();
		}else{
	   	    return_data['regis_status']='error';
			return_data['message']='Bad request, please try again!';
			callback();
		}
	});
}

var check_user_is_exit= function(email_id, callback){
	$ret='';
		var query="SELECT email_id from test4 WHERE email_id = ?";
    connection.query(query,[email_id],function(err,user_return){
    	if(user_return.length > 0){ 
        	return_data['regis_status']='error';
			return_data['message']='user is already exists!';  		    		
    		$ret=1;
    		callback($ret);
    	}else{    		
    		$ret=0;
    		callback($ret);
    	}         	 	 
    });    
}

app.get('/dashboad',function(req,res){	
 	session_data=req.session;   
 	return_data['session_data']=session_data;
	if(typeof session_data.email_id !== "undefined"){    
        res.render(__dirname + '/dashboad.html',return_data);
	}else{
		res.redirect('/login');
	}
});


app.post('/user_registration',function(req,res){
	    var first_name=req.body.first_name;
	    var last_name=req.body.first_last;
	    var email_id=req.body.email_id;
	    var password=req.body.password;
	    var test='';

        return_data=[];
		return_data['first_name']=first_name;
		return_data['first_last']=last_name;
		return_data['email_id']=email_id;
		return_data['password']=password;
		return_data['session_data']=req.session;

    	if(first_name=="" || last_name=="" || email_id=="" || password=="" ){
			return_data['regis_status']='error';
    		return_data['message']='All field is require.';
            res.render(__dirname + '/registration.html',return_data);
            return;
    	} 	   	
    	password=sha1(password);

    check_user_is_exit(email_id,function(retr){
    	if(retr==0){

    		//user registration 
    		$field={'first_name':first_name,'first_last':last_name,'email_id':email_id,'password':password};

    		insert($field,function(retr){
              req.session.email_id=email_id;            

    		 	res.redirect('/dashboad');
    	    });		
    	}else{
    		res.render(__dirname + '/registration.html',return_data);
    	}	
    	 
	});
});


app.get('/logout',function(req, res){
	req.session.destroy();
	res.redirect('/dashboad');
});

app.post('/user_login',function(req, res){
     $username=req.body.username;     
     $password=req.body.password;

     if($username!="" && $password!=""){
	    var query="SELECT * from test4 WHERE email_id = ? AND password = ?";

	    connection.query(query,[$username,$password],function(err,data){
	    	res.send(data);

		   //  	if(user_return.length > 0){ 
		   //      	return_data['regis_status']='error';
					// return_data['message']='user is already exists!';  		    		
		   //  		$ret=1;
		   //  		//callback($ret);
		   //  	}else{    		
		   //  		$ret=0;
		   //  	//	callback($ret);
		   //  	}     
	       	 	 
    	});
	}else{
		return_data['login_status']='error';
    	return_data['message']='All field is require.';
        res.render(__dirname + '/login.html',return_data);
        return;
	}
});

function check_user_is_login(req){
	session_data=req.session;   
 	return_data['session_data']=session_data;
	if(typeof session_data.email_id !== "undefined"){    
       return 1;
	}else{
		return 0;
	}

}
app.get('/login',function(req, res){	

 $login_check= check_user_is_login(req);

    session_data=req.session;       
 	return_data['session_data']=session_data;

    if($login_check){    
        res.render(__dirname + '/dashboad.html',return_data);
	}else{
		res.render(__dirname + '/login.html');
	}  	
});
app.listen(8080);