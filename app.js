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
    name: {type:String, required: true},
    fname: String,
    rollno: {type:String, required: true},
    dob: Date,
    email: {type:String, required: true},
    mob: {type:Number,required: true},
    branch: {type:String, required: true},
    year: {type:String, required: true},
  });
  var Student = mongoose.model("Student", studentSchema);
  var mysort = {rollno: 1};
const teacherSchema = new mongoose.Schema({
  name: {type:String, required: true},
  username: {type:String, required: true},
  password: String,
  email: {type:String, required: true}
});

const attendenceSchema = new mongoose.Schema({
 subid: {type:String, required: true},
 lno: {type:Number,required: true},
 date: Date,
 rno: Array
})

teacherSchema.plugin(passportLocalMongoose);
const Teacher = mongoose.model("Teacher", teacherSchema);

const Attendence = mongoose.model("Attendence", attendenceSchema);

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
  Teacher.register({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email
  }, req.body.password, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.render("loginp");
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
        res.render("loginp");
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
      res.send("Thank You!");
    }
  });
});

app.get("/logins",function(req,res){
  res.render("logins");
});

app.post("/logins",function(req,res){
  const name = req.body.name;
  const rol = req.body.rol;
  Student.find({name: name, rollno: rol},function(err,found){
    if (err) {
      res.send(err);
    } else {
      if (found) {
        res.render("registersp");
      } else {
        res.send("Not found!");
      }
    }
  })
})

app.get("/batch",function(req,res){
  if(req.isAuthenticated()){
  res.render('batch');
}else{
  res.redirect("/login");
}
});

app.get("/attendence",function(req,res){
  if(req.isAuthenticated()){
    res.render("Attendence");
  }else {
    res.redirect("/login");
  }
});

app.post("/batch",function(req,res){
  const stream = req.body.batch;
  const year = req.body.year;

  Student.find({branch:stream , year:year},function(err,foundUsers){
    if(err){
      console.log(err);
    }else{
      if(foundUsers){
        res.render("attendence",{name: foundUsers});
      }
      else{
        res.send("No student found");
      }
    }
  }).sort(mysort);
});

app.post("/attendence",function(req,res){
  const d = req.body.checkb;
  var newat = new Attendence({
    subid: req.body.subid,
    lno: req.body.lno,
    date: req.body.date,
    rno: d,
  });
  newat.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/loginp");
    }
  })
})
app.get("/details",function(req,res){
  res.render("details");
})
app.post("/details",function(req,res){
  const subid = req.body.subid;
  const rn = req.body.rno;
        Attendence.find({subid: subid},function(err,user){
          if(err){
            console.log(err);
          }else{
            console.log(user);
            res.render("detailp",{name: user, rn: rn});
          }
        })
});

app.get("/Attendence_Register",function(req,res){
  if(req.isAuthenticated()){
  res.render("atr");
}else{
  res.redirect("/login");
}
});

app.post("/Attendence_Register",function(req,res){
  const sub = req.body.subid;
  Attendence.find({subid: sub},function(err,found){
    if(err){
      console.log(err);
    }else{
      res.render("atrp",{name: found});
    }
  });
});
app.get("/data",function(req,res){
  if(req.isAuthenticated()){
    res.render("data");
  }else{
    res.redirect("/login");
  }
});
app.post("/data",function(req,res){
  const rn = req.body.rn;
  Student.findOne({rollno: rn},function(err,user){
    if(err){
      console.log(err);
    }else{
      if(user){
      res.render("datap", {name:user,rn: rn});
    }else{
      res.send("No Found");
    }

    }
  })
});
app.get("/calcutad",function(req,res){
  res.render("calcuted");
});

app.post("/calcutad",function(req,res){
  const branch = req.body.branch;
  const year = req.body.year;
  const subid = req.body.subid;
  Student.find({branch: branch,year:year},function(err,found){
    if(err){
      console.log(err);
    }else{
      if(found){
        console.log(found);
        Attendence.find({subid:subid},function(err,found1){
          if(err){
            console.log(err);
          }else{
            console.log(found1);
            res.render("calcutedp",{name:found,roll:found1})
          }
        })
      }else{
        res.send("Not found");
      }
    }
  }).sort(mysort);
})


app.listen(3000,function(){
  console.log("server is running on port 3000");
});
