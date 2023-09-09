//express package
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const path = require('path');
const ejs = require('ejs');
const { log, time } = require("console");
const allblogs = require('./allblogs');

const bodyParser = require('body-parser');

//rest object
//create an instance of an Express application using Node.js
const app = express(); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



//middlewares
// Enables Cross-Origin Resource Sharing for your server.
app.use(cors());
// Parses JSON data in incoming requests.
app.use(express.json());
// Logs HTTP requests in a developer-friendly format.
app.use(morgan('dev'));
// used to parse incoming data from HTML forms that are submitted via the application/x-www-form-urlencoded format
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname,"/assets")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



const uri = "mongodb+srv://vk:Bhavani1201@cluster0.kslyn8z.mongodb.net/";


const connectDB = async() => {
    try{
        const conn = await mongoose.connect(uri);
        console.log(`Connected to MongoDB Successfully ${conn.connection.host} `.bgGreen.white);
    }
    catch(err){
        console.log(`Error connecting to MongoDB`.bgWhite.re);
    }
}
connectDB();


const usersSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password:{
        type:String,
        required : true,
        unique : true
    }
    ,role:{
        type:Number,
        default : 0
    }
},{timeStamps:true});

const users = new mongoose.model("users", usersSchema);

var userid = "";
var role = 0;

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await users.findOne({ email: email});
        if (user) {
            if (password === user.password) {
                userid = user._id;
                console.log(userid);
                role = user.role;
                res.redirect('/home'); // Render the EJS template named 'ecommerce.ejs'
                
            } else {
                res.send({ message: "Password didn't match" });
            }
        } else {
            res.redirect("/register");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
});


app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingusers = await users.findOne({ email: email }); // Use email1, not email

        if (existingusers) {
            res.redirect('/login');
        } else {
            const newusers = new users({
                name,
                email,
                password,
                role: 0,
            });

            await newusers.save();
            res.redirect("/login"); 
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
 });



app.get('/register', async (req, res) => {
    res.render("register");// Assuming your EJS file is in a "views" folder

});
app.get('/login', async (req, res) => {
    res.render("login"); // Assuming your EJS file is in a "views" folder

});

const blogSchema = new mongoose.Schema({
    userid:String,
    date:Date,
    author:String,
    bannerImageUrl: String,
    authorImageUrl: String,
    tags: [String],
    title: String,
    content: String,
  });
  
  const blogs = mongoose.model('blogs', blogSchema)


  allblogs.forEach(async(blog) => {

        
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const meridiem = hours >= 12 ? 'PM' : 'AM';

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${meridiem}`;


    try {
      // Check if the blog already exists in the database by searching for its title (or any unique identifier)
      const existingBlog = await blogs.findOne({ title: blog.title });
  
      if (!existingBlog) {
        // Create a new Blog document using the Mongoose model
        const newBlog = new blogs({
          userid: "64e6adab2f84ba8ff02ac269",
          date:formattedDateTime,
          author: "GANTA VENKATA KOUSIK",
          bannerImageUrl: blog.bannerImageUrl,
          authorImageUrl: blog.authorImageUrl,
          tags: blog.tags,
          title: blog.title,
          content: blog.content
        });
  
        // Save the new blog document to the database
        try {
          await newBlog.save();
          console.log("Blog added successfully:", blog.title);
        } catch (err) {
          console.error("Error saving blog:", err);
        }
      } else {
        console.log("Blog already exists:", blog.title);
      }
    } catch (error) {
      console.error('Error inserting blogs:', error);
    }
  });

  app.get("/home", async(req, res) => {
    try{
        const alblogs = await blogs.find({});
        res.render("home", {alblogs});
    }
    catch(err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
})
  
app.get("/myblogs", async(req, res) =>{
    try{
        const alblogs = await blogs.find({userid:userid});
        console.log(alblogs);
        res.render("myblogs", {alblogs});
    }
    catch(err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
})


app.get("/create-blog", async(req, res) =>{
    res.render("createblog");
})

app.post("/upload-blog", async(req, res) =>{
            
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    try {
        const { bannerImageUrl, authorImageUrl, tags,title, content} = req.body;
        const user = await users.findOne({ _id:userid});
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${meridiem}`;

        console.log(formattedDateTime);
        console.log(user);


        const newBlog = new blogs({
            userid,
            date:formattedDateTime,
            author : user.name,
            bannerImageUrl,
            authorImageUrl,
            tags,title, content
        });
        
        const blog = await blogs.findOne({userid,
                                title,content})
        if(blog) {
            console.log("blog already exists");
            res.redirect("/home");
        }
        else{
            await newBlog.save();
            console.log("Blog uploaded successfully");
            res.redirect('/uploadsuccess');
        }
        // Use the productId to update the specific product in MongoDB
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
})

app.get('/uploadsuccess', (req, res) => {
    res.render('uploadsuccess');
})

app.get("/",async(req, res)=>{

    res.redirect("/login");
});
  app.listen(9002,() => {
    console.log("BE started at port 9002");
})
