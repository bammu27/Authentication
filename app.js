//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

const saltRounds = 10;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static('public'));

// Set up session middleware
app.use(session({
    secret: "The first trillion",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

// Set up Passport middleware
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  "mongodb+srv://mahaveerkashetti203:jnssm88hk32xPHHQ@cluster0.ma3mv5z.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);


const userSchema = new mongoose.Schema({
    username: {
      type: String,
      minLength: 10,
      lowercase: true,
    },
    password: {
      type: String,
      minLength: 6,
    },
    googleId: String,
    secret: String,
  });
  


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model('User', userSchema);

// Configure Passport to use LocalStrategy
passport.use(User.createStrategy());

passport.serializeUser(function(user,done){
    done(null,user.id)

})
passport.deserializeUser(function(id,done){
    User.findById(id,function(user,err){
        done(err,user)
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



// Home route
app.get('/', async (req, res) => {
  res.render('home');
});
app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] }));

  
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

// Register route
app.get('/register', (req, res) => {
  res.render('register');
});

// Secrets route (protected route)
app.get("/secrets", async function(req, res){
    try {
      const foundUsers = await User.find({ "secret": { $ne: null } });
      if (foundUsers) {
        res.render("secrets", { usersWithSecrets: foundUsers });
      }
    } catch (err) {
      console.log(err);
    }
  });


// Register POST route (handling user registration)
app.post('/register', async (req, res) => {
    // Create a new user with the provided username and password
    User.register({username: req.body.username, active: false}, req.body.password, function(err, user) {
        if(err){
            console.log(err);
            res.redirect('/register');
        }
        else{
            // Authenticate the user and redirect to the secrets page
            passport.authenticate('local')(req,res,()=>{
                res.redirect('/secrets');
            });
        }
    });
});

// Login POST route (handling user login)
app.post('/login', async (req, res) => {
    // Create a new user object with the provided username and password
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    
    // Use Passport's req.login() to log in the user
    req.login(user, (err) => {
        if(err){
            console.log(err);
        }else{
            // Authenticate the user and redirect to the secrets page
            passport.authenticate('local')(req,res,()=>{
                res.redirect('/secrets');
            });
        }
    });
});

// Logout route
app.get('/logout', (req, res) => {
    // Use req.logout() to log out the user
    req.logout(function (err) {
        if (err) {
            // Handle the error, if any
            console.error(err);
        }else{
            res.redirect('/');
        }
    });
});




app.get('/submit',(req,res)=>{
    if(req.isAuthenticated()){
        res.render('submit')
    }else{
        res.redirect('/login')
    }

})

app.post('/submit', async (req, res) => {
    const submittedSecret = req.body.secret;

    const foundUser = await User.findById(req.user.id);
    if (!foundUser) {
        console.log("Secret is not added.");
    } else {
        foundUser.secret = submittedSecret;
        await foundUser.save();
        res.redirect('/secrets');  // Redirect to '/secrets' instead of '/secret'
    }
});


app.listen(3000, function () {
  console.log("Server started on port 3000");
});












