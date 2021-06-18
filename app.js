const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const alert = require('alert');
const session = require('express-session');
const flush = require('connect-flash');
const { stat } = require('fs');


const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'secret',
    cookie: {maxAge:1000},
    resave: false,
    saveUninitialized: false
}));

app.use(flush());
/* creating mysql connecion */

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "cmritlib"
  });
  
  db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });


/* end of mysql connection */


app.get("/", (req, res) =>{
    res.render('home');
})


//login page
app.get("/login", (req,res)=>{
    res.render('login',{message: req.flash('message')});
});

// admin login page 
app.get("/admin_login", function(req, res){
    res.render('admin_login', {message: req.flash('message')});
})

//register page
app.get('/register', (req,res)=>{
    res.render('register');
})

//main home page
app.get("/mainhome", function(req,res){
    res.render('mainhome',{username: name, message: req.flash('message')});
})

//admin home page
app.get('/admin_home', function(req, res){
    res.render('admin_home',{username: admin_name,message: req.flash('message') })
})

//book page
app.get("/book", function(req,res){
    var sql = "select * from book";
    db.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
           res.render('book',{result: result,username:name});
        }
    })
    
});

//add book page
app.get('/add_book', function(req, res){
    res.render('add_book', {username: admin_name, message: req.flash('message')})
})

//compose research page
app.get("/compose-research", function(req, res){
    res.render('compose',{username:name, message: req.flash('message')});
})

//handling get request for issue books
app.get("/issue_books", function(req, res){
    res.render('issue_books',{username: name, message: req.flash('message')})
})

//research page
app.get("/research", function(req,res){
    var sql = "select * from research";
    db.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
           res.render('research',{result: result,username:name, message: req.flash('message')});
        }
    })
})

//admin book page
app.get('/admin_book', function(req, res){
    var sql = "select * from book";
    db.query(sql, function(err, result){
        if(err){
            throw err;
        }else{
           res.render('admin_book',{result: result,username:admin_name});
        }
    })
})

//admin notice page
app.get("/admin_notice", function(req, res){
    res.render('admin_notice', {username: admin_name});
})

// get request for admin book logs page
app.get("/book_logs", function(req, res){

    var sql = "call get_book_log";
    db.query(sql, function(err, result){
        if(err){
            throw err;
        }else if(result.length === 0){
            console.log("NOthing found!!!");
        }else{
            console.log(result)
            res.render('book_logs',{result: result[0], username: admin_name});
        }
    })
})

//function for routing parameters
app.get("/research/:topic", function(req,res){
    let sql = 'Select * from research where Title=?';
    db.query(sql,req.params.topic, function(err,result){
        if(err){
            throw err;
        }else{
            res.render('research-post',{result: result, username: name});
        }
        
    })
    // console.log(req.params.topic);
    // res.redirect("/research");
})

// notice page
app.get("/notice", function(req, res){
    res.render("notice",{username:name});
})

//post req for user login page
app.post('/login', (req,res)=>{
     name = req.body.username;
    let pwd = req.body.password;
    
    
    let sql =  "select * from `users` where username=? AND password=? ";

    db.query(sql,[name,pwd], function(err,result){
       
        if(result.length===0)
        {
            req.flash('message','Invalid Credentials!! Please try again!!');
            //console.log('Invalid credentials!!!');
            res.redirect('/login');
        }else {
            req.flash('message', 'Loged-in Successfully!!');
            res.redirect('/mainhome');
            console.log("Login successfull");
            //res.render('mainhome',{username: name});
        }
    })
})


// post req for admin login page 
app.post('/admin_login', function(req, res){
    admin_name = req.body.username;
    let pwd = req.body.password;
    
    
    let sql =  "select * from admin_login where email=? AND password=? ";

    db.query(sql,[admin_name,pwd], function(err,result){
       
        if(result.length===0)
        {
            req.flash('message','Invalid Credentials!! Please try again!!');
            //console.log('Invalid credentials!!!');
            res.redirect('/admin_login');
        }else {
            req.flash('message', 'Loged-in Successfully!!');
            res.redirect('/admin_home');
            console.log("Login successfull");
            //res.render('mainhome',{username: name});
        }
    })
})

//post register page
app.post('/register', (req, res)=>{
    let name = req.body.username;
    let pwd = req.body.password;
    let usn = req.body.usn;

    let user = {username: name, password: pwd, usn: usn};
    var sql = "INSERT INTO users SET ?";
    let query = db.query(sql, user, (err, res)=>{
        if(err){
            throw err;
        } 
    })
    req.flash('message', 'Registered Successfully!!');
    res.redirect("/login");
    
   
})

//post search-bar
app.post("/search-bar", function(req, res){
    let bookname = req.body.searchbook;
    //console.log(bookname)
    var sql = "SELECT * FROM book WHERE name LIKE CONCAT(?,'%')";
    db.query(sql,bookname, function(err, result){
        if(err){
            throw err;
        }else{
            res.render('book',{result: result, username: name});
        }
    })
    // console.log(bookname);
    // res.redirect('/book');
})

// post compose page
app.post('/compose-research', function(req, res){
    let title = req.body.title;
    let post = req.body.message;
    // console.log(title);
    // console.log(post);
    let research = {
        Title : title,
        Content : post,
        Author : name
    };
    var sql = "Insert into research SET ?";
    db.query(sql,research, function(err, result){
        if(err){
            throw err;
        }else{
            req.flash('message', 'Paper added successfully!!');
            res.redirect('/research');
        }
    })
    // res.redirect("/compose-research");
})

// add book page 
app.post('/add_book', function(req, res){
    var bid = req.body.bid;
    var bname = req.body.bname;
    var aname = req.body.aname;
    var edition = req.body.edition;
    var status = req.body.status;
    var department = req.body.department;

    console.log(bid);
    console.log(bname); 
    console.log(aname);
    console.log(edition);
    console.log(status);
    console.log(department);

    let book = {bid: bid, name: bname, authors: aname, edition: edition, status: status, department: department};
    var sql = "INSERT INTO book SET ?";
    db.query(sql, book, (err, result)=>{
        if(err){
            throw err;
        }else{
            req.flash('message', 'Book added successfully!!');
            res.redirect('/add_book');
        } 
       
    })
})

// post request for issue_books page
app.post('/issue_books', function(req, res){
    var bid = req.body.book_id;
    var book_name = req.body.book_name;
    var today = new Date().toISOString().slice(0, 10);
    var username = name;
    console.log(bid, book_name,  today, username);

   
    var issued_book={
        bid : bid,
        book_name : book_name,
        Date_of_issue : today,
        username : name
    }
    console.log(issued_book)

    
    var sql = 'insert into issued_books SET ?';
    db.query(sql, issued_book, function(err, result){
        if(err){
            throw err;
        }else{
            console.log("Inserted successfully!!");
            res.redirect("/issue_books");
        }
    })
   
})


//listening on the server 3000
app.listen(3000, () =>{
    console.log("Server started at 3000");
});


