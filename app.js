const express = require("express");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require('mongoose');

const app = express();

var Name =[];
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine',"ejs");
app.use(session({
  secret: "Our little Secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/Attend", {useNewUrlParser: true, useUnifiedTopology:true});
mongoose.set("useCreateIndex", true);
const studentSchema = new mongoose.Schema({
  name: String,
  fname: String,
  rollno: String,
  dob: Date,
  email: String,
  mob: Number,
  branch: String,
  year: String
});
const teacherSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  subject: String,
  email: String
})

teacherSchema.plugin(passportLocalMongoose);
const Teacher = mongoose.model("Teacher", teacherSchema);
const Student = mongoose.model("Student", studentSchema);

passport.use(Teacher.createStrategy());
passport.serializeUser(Teacher.serializeUser());
passport.deserializeUser(Teacher.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});

app.get("/registert",function(req,res){
  res.render("register");
});

app.get("/registers",function(req,res){
  res.render("registerS");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.post("/registert",function(req,res){
  Teacher.register({name:req.body.name, username:req.body.username, email:req.body.email, subject:req.body.subject}, req.body.password, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/registert");
      })
    }
  })
});

app.post("/login",function(req,res){
  const user = new Teacher({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local") (req,res,function(){
        res.render("batch");
      });
    }
  });
});

app.post("/registers",function(req,res){
  var newst = new Student({
    name: req.body.name,
    fname: req.body.fname,
    rollno: req.body.rollno,
    dob: req.body.dob,
    email: req.body.email,
    mob: req.body.mob,
    branch: req.body.branch,
    year: req.body.year
  });
  newst.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
});

app.get("/batch",function(req,res){
  res.render('batch');
});


app.post("/batch",function(req,res){
  const stream = req.body.batch;
  const year = req.body.year;

  Student.findOne({batch:stream , year:year},function(err,foundUsers){
    if(err){
      console.log(err);
    }else{
      if(foundUsers){
        Name.push(foundUsers.name);
        res.render("Attendence",{name: Name});
      }
      else{
        res.send("No student found");
      }
    }
  })
})

















app.listen(3000,function(){
  console.log("server is running on port 3000");
});
