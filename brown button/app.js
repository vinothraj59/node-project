var express= require("express");
var http = require('http');
var fs = require('fs');

var multer = require('multer');
var csv = require('fast-csv');

var Router = express.Router;
var upload = multer({ dest: 'uploads/' });
var app = express();
var router = new Router();
var mongoose= require("mongoose");
mongoose.connect("mongodb://localhost/studentdb");
var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
var methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set("view engine","ejs");
app.use('/upload-csv', router);

var studentSchema= mongoose.Schema({
    name:String,
    age:String,
    geocode:String,
    dept:String
});

var Student = mongoose.model("Student",studentSchema);

// I followed RESTful Routing pattern
// STUDENT CRUD ROUTES
app.get("/students",function(req,res){
    res.render("home");
});

app.get("/students/new",function(req,res){
    res.render("newstudentform");
});

app.post("/students",function(req,res){
var name=req.body.name;
var age=req.body.age;
var geocode=req.body.geocode;
var dept=req.body.dept;

var newstudent={name:name,age:age,geocode:geocode,dept:dept };

// console.log(newstudent);
 Student.create(newstudent,function(err,createdstudent){
 if(err){
  console.log(err);
 }else{
      createdstudent.save();
    //   console.log("student saved");
    res.redirect("/students");
 }
 });
});

app.get("/students/show",function(req,res){
        Student.find({},function(err,foundstudents){
            if(err){
                console.log(err);
            }else{
                // console.log(foundstudents);
                res.render("showstudents",{foundstudents:foundstudents});
            }
        });
});

app.get("/students/:id/edit",function(req,res){
    Student.findById(req.params.id, function(err,foundstudent){
            if(err){
                console.log(err);
            }else{
                res.render("editstudent",{student:foundstudent})
            }
    });

});

app.put("/students/:id",function(req,res){
    Student.findByIdAndUpdate(req.params.id, req.body.up,function(err,updatedstudent){
        if(err){
            console.log(err);
        }else{
            // console.log(updatedstudent);
            res.redirect("/students/show");
        }
    })
});

app.delete("/students/:id", function(req,res){
 Student.findByIdAndDelete(req.params.id,function(err){
     if(err){
         console.log(err);
     }else{
         res.redirect("/students/show");
     }
 } );
});
//  GEOCODE SEARCH ROUTE
app.get("/students/search",function(req,res){
       res.render("search");
});

app.get("/students/searchgeocode",function(req,res){
    //   console.log(req.query.geocode);
    Student.find({geocode:req.query.geocode},function(err,foundstudents){
        if(err){
            console.log(err);
        }else{
            res.render("showgeocode",{foundstudents:foundstudents});
        }
    });
});

app.post('/profile', upload.single('studentdata'), function (req, res) {
    const fileRows = [];

  // open uploaded file
  csv.fromPath(req.file.path)
    .on("data", function (data) {
      fileRows.push(data); // push each row
    })
    .on("end", function () {
    //   console.log(fileRows);
      fileRows.forEach(function(studentlist){
         var newstudent={name:studentlist[0],age:studentlist[1],geocode:studentlist[2],dept:studentlist[3]};
         Student.create(newstudent,function(err,createdstudent){
            if(err){
             console.log(err);
            }else{
                 createdstudent.save();
               //   console.log("student saved");
            }
            });
      });

      fs.unlinkSync(req.file.path);   // remove temp file
      //process "fileRows" and respond
    })
    res.redirect("/students/show");
  });

app.listen(3000,function(){
    console.log("Student project server started");
})
