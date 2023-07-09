//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static('public'))


mongoose.connect(
    "mongodb+srv://mahaveerkashetti203:jnssm88hk32xPHHQ@cluster0.ma3mv5z.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedtopology: true }
  );


const userSchema = new mongoose.Schema({

email:{
    type: String,
    minLength: 10,
    required: true,
    lowercase: true,
},
password:{
    type:String,
    required:true,
    minLength:6

}
})


userSchema.plugin(encrypt, { secret: process.env.SECREAT, encryptedFields: ['password'] })

const User = mongoose.model('User',userSchema)



app.get('/',async(req,res)=>{
    res.render('home')
})
app.get('/login',(req,res)=>{
    res.render('login')
})
app.get('/register',(req,res)=>{
    res.render('register')
})
app.get('/submit',(req,res)=>{
    res.render('submit')
})


app.post('/register',async(req,res)=>{

 const email = req.body.username;
 const password = req.body.password;

 const newuser = new User({
    email:email,
    password:password
 })

await newuser.save();


if(!newuser){
   res.send("Enter password greater than 6 character or valid email")
}else{
    res.render('secrets')
}


})

app.post('/login',async(req,res)=>{

const loginemail = req.body.username;
const loginpassword = req.body.password;

       const loginuser = await User.findOne({
                email:loginemail,
                password:loginpassword

               })
        if(!loginuser){
            res.send("your not registred")
        }else{
            res.render('secrets')
        }
        





})











app.listen(3000,()=>{
    console.log("server is running on 3000")
})