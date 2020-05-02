//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const md5 = require("md5");
const session = require('express-session');
const passport = require('passport');
const passportlocalmongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended: true}));
app.use(session({
    secret: 'fasdghjklasdfghjkl',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
});

userSchema.plugin(passportlocalmongoose);
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res) {
    res.render('login');
})

app.get('/register', function(req, res) {
    res.render('register');
});

app.get('/secrets', function(req, res) {
    User.find({'secret': {$ne: null}}, function(err, users) {
        if (err) {
            console.log(err);
        } else {
            if (user) {
                res.render("secrets", {usersWithSecrets: users});
            }
        }
    });
    console.log('does it get here 4')
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()) {
        console.log('does it get here 5');
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get('/submit', function(req, res) {
    console.log('does it get here 4')
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()) {
        console.log('does it get here 5');
        res.render('submit');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
})

app.post('/login', function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect('/secrets');
            })
        }
    })
});

app.post('/register', function(req, res) {
    console.log("does it get here bruh")
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        console.log(req.body);
        if (err) {
            console.log(err);
            res.redirect('/register')
        } else {
            console.log("does it get here 2")
            passport.authenticate('local', { successRedirect: '/secrets', failureRedirect: '/registration' })
            //passport.authenticate("local")(req, res, function() {
              //  console.log('does it get here 3');
                //res.redirect('/secrets');
            //});
        }
    });
});

app.post('/submit', function(res, res) {
    const submittedSecret = req.body.secret;

    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.secret = submittedSecret;
                foundUser.save(function() {
                    res.redirect('/secrets');
                });
            }
        }
    });
});

app.listen(3000, function() {
    console.log("server started on port 3000");
});