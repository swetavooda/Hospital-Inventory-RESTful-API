var express=require("express");
var app=express();

// Connecting server file for AWT
let middleware = require('./middleware');
let server=require('./server');

//bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//mongodb
const MongoClient=require('mongodb').MongoClient;

//databse connection
const url='mongodb://localhost:27017';
const dbName='hospitalInventory';
const err="Error 404 not found...";
let db
MongoClient.connect(url,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },(err,client)=>{
if(err) return console.log(err);
db=client.db(dbName);
console.log(`Connected Database: ${url}`);
console.log(`Database: ${dbName}`);
});



// Read Hospital details
app.get('/hospitalDetails', middleware.checkToken, function(req,res){
  console.log("Fetching data from Hospital Collection");
  var data = db.collection('hospital').find().toArray(function(err,doc){
    if (err) console.log(err);
    res.json(doc);
  });      
});

// Read ventilator details
app.get('/ventilatorDetails',middleware.checkToken, function(req,res){
  console.log("Fetching data from Ventilator Collection");
  db.collection('ventilator').find().toArray(function(err,doc){
    if (err) console.log(err);
    res.json(doc);
  });      
});

// Search Hospitals by Hospital Name
app.post('/searchHospitalByName',middleware.checkToken, function(req,res){
var name = req.body.name;
  console.log("Searching hospitals by hospital name "+name);
  var data = db.collection('hospital').find({"name":new RegExp(name,'i')}).toArray(function(err,doc){
    if (err) console.log(err);
    res.json(doc);
  });      
});

// Search Ventilators by Status 
app.post('/searchVentByStatus', middleware.checkToken,function(req,res){
    var newstatus = req.body.status;
    console.log("Searching ventilators by status "+newstatus);
    var data = db.collection('ventilator')
    .find({"status":newstatus}).toArray(function(err,doc){
      if (err) console.log(err);
      res.json(doc);
    });      
  });
  
  // Search Ventilators by Hospital
  app.post('/searchVentByHospital',middleware.checkToken, function(req,res){
    var name = req.body.name;
    console.log("Searching ventilators by hospital name "+name);
    db.collection('ventilator').find({"name":new RegExp(name,'i')}).toArray(function(err,doc){
      if (err) console.log(err);
      res.json(doc);
    });      
  });
  
  // Update ventilator Status
  app.put('/updateVentStatus',middleware.checkToken, function(req,res){
      var ventid={ventilatorId:req.body.ventilatorId};
      var newstatus={$set:{"status":req.body.status}}
      console.log("Updating ventilator details");
      db.collection('ventilator').updateOne(ventid,newstatus);
      db.collection('ventilator').findOne({"ventilatorId":req.query.vid},function(err,doc){
        if (err) throw err;
        res.send("updated 1 record");
      });
  });
  
  // Delete ventilator by vid
  app.delete('/deleteVent',middleware.checkToken, function(req,res){
      var ventid={ventilatorId:req.body.ventilatorId};
      console.log("Deleting ventilator details");
      db.collection('ventilator').deleteOne(ventid);
      res.send("deleted 1 record");
  });
  
  
  // Add ventilators 
  app.post('/InsertVent',middleware.checkToken, function(req,res){
    var hId = req.body.hId;
      var ventilatorId=req.body.ventilatorId;
      var status=req.body.status;
      var name=req.body.name;
      var item=
      {
        hId:hId,ventilatorId:ventilatorId,status:status,name:name
      };
    console.log("Inserting ventilator details");
    db.collection('ventilator').insertOne(item,function(err,result){
      res.json("item Inserted");
    });
  });
  
  
  

app.listen(3000);