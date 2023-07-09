//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const saltRounds = 10;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static('public'))

mongoose.connect(
  "mongodb+srv://mahaveerkashetti203:jnssm88hk32xPHHQ@cluster0.ma3mv5z.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    minLength: 10,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  }
});

const User = mongoose.model('User', userSchema);

app.get('/', async (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/submit', (req, res) => {
  res.render('submit');
});

app.post('/register', async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.send('User already exists');
    } else {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = new User({
        email: email,
        password: hashedPassword
      });
      await newUser.save();
      res.render('secrets');
    }
  } catch (error) {
    res.send('An error occurred');
  }
});

app.post('/login', async (req, res) => {
  const loginemail = req.body.username;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: loginemail });

    if (!user) {
      res.send('User not registered');
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        res.render('secrets');
      } else {
        res.send('Invalid password');
      }
    }
  } catch (error) {
    res.send('An error occurred');
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});












