const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const multer = require('multer')
const mongoose = require('mongoose')

const app = express();
app.set("view engine", "ejs");

mongoose.connect('mongodb://localhost:27017/filestorage');

const fileStorageSchema = new mongoose.Schema({
      name : String,
      imageUrl : String
});

const fileStorageModel = mongoose.model('FileStorage', fileStorageSchema);


const fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
            cb(null, 'images');
      },
      filename: (req, file, cb) => {
            const receivedDateAndTime = new Date();

            const imageReceivedDate = receivedDateAndTime.getDate().toString() + '-' + receivedDateAndTime.getMonth().toString() + '-' + receivedDateAndTime.getFullYear().toString();
            const imageReceivedTime = receivedDateAndTime.getHours().toString() + '-' + receivedDateAndTime.getMinutes().toString();
            const newFileName = imageReceivedDate + '-' + imageReceivedTime;

            cb(null, newFileName + '-' + file.originalname);
      }
});

const fileFilter = (req, file, cb) => {
      if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
            cb(null, true);
      }
      else{
            cb(null, false, (req, res) => {
                  res.redirect("/file-format-error");
            });
      }
};

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public")); 

app.get("/", (req, res) => {
      res.render("index");
});

app.get("/submit", (req, res) => {
      res.render("submitted");
})


app.post("/", multer({storage:fileStorage, fileFilter:fileFilter}).single('image'), (req, res) => {      
      const image = req.file;
      const imageUrl = image.path;

      const newFileStorage = new fileStorageModel({
            name : req.body.name,
            imageUrl : imageUrl
      });

      newFileStorage.save();
      res.redirect("/");
});

app.get("/file-format-error", (req, res) => {
      res.render("error1.ejs");
});



app.listen(3000,() => {
      console.log("app running in port 3000");
})