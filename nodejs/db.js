var mysql = require('mysql');
 connection = mysql.createConnection({
    //host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : 'test2'
});

 connection.connect(function(err) {
    if (err) throw err;    
 });
 return connection;