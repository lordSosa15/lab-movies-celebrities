const express = require("express");
const User = require("../models/User.model");
const router = express.Router();
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

const { isLoggedIn, isLoggedOut } = require("../config/route-guard.config")

// GET route to display the signup form to a user
router.get("/auth/signup", (req, res, next) => {
  res.render("auth/signup");
});

// POST route to save a new user in the database
// <form action="/signup" method="POST">
router.post("/auth/signup", (req, res, next) => {
    // console.log(req.body);

    const saltRounds = 10;

    const { username, email, password } = req.body;

    if (!username || !email || !password){
    res.render("auth/signup", {
        errorMessage: " all fields are mandatory, please provide your username , email and password"
    // errorMessage is a place holder and must be reused in HBS file
    }) 
    return;
    }
//make sure passwords are strong ---- either here or match in user.model
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)){
        res
        .status(500)
        .render("auth/signup", { errorMessage: "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter."})
        return
    }



//console.log(username, email, password)
    bcrypt
    .genSalt(saltRounds)
    .then(salt => bcrypt.hash(password, salt))
    .then(hashedPassword => {
        //console.log(hashedPassword)
        return User.create({ 
            username, 
            email,
            passwordHash: hashedPassword
        })
    })
    .then((userFromDB) => {
        //console.log(`New user created: ${userFromDB}`);
        res.redirect("/auth/login")
    })
    .catch(err => {
        console.log(err);
        if(err instanceof mongoose.Error.ValidationError) {
            res.status(500).render("auth/signup", {
                errorMessage: err.message
            })
        } else if (err.code === 11000){
                res.status(500).render("auth/signup", {
                    errorMessage: "username and email need to be unique. Either username or email is already in use"
                })
        } else {
                console.log("error: ", err.message);
                next(err);
        }
    })
})  
//******************************
// GET ROUTE TO DISPLAY THE LOGIN FORM

router.get("/auth/login", isLoggedOut, (req, res) => {
    res.render("auth/login")
})


//******************************
// POST ROUTE TO LOGIN
 router.post("/process-login", (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password){
        res.render("auth/login", {
            errorMessage: "All fields are mandatory. Pease provide your email and password to log in"
        })
        return;
    }

    // use email address user inputted to check if the user exist in our DB
    User.findOne({ email })
    .then(userFromDB => {
        //userFromDB is a user object
        //if user doesn't exist, send error message
        if (!userFromDB){
            res.render("auth/login", {
                errorMessage: "Email is not registered. Try a different email"
            })
            return;
        } else if (bcrypt.compareSync(password, userFromDB.passwordHash)){
            // if user exists, check if
            // password user inputted matches with the one saved in the DB
            // if yes, then render the profile page

            req.session.currentUser = userFromDB;
            res.redirect("/auth/profile")
        } else {
            // if passwords don't match, then send errorMessage to a user
            res.render("auth/login", {
                errorMessage: "Incorrect password."
        })
    }
 })
 .catch(err => {
     console.log(err);
     next(err);
 })
})

// POST ROUTE TO LOGOUT USER


router.post("/logout", (req, res, next) => {
    req.session.destroy(err => {
        console.log(`Err while logout`)
        if (err) next(err);
        res.redirect("/")
    })
})





// GET ROUTE TO DISPLAY USER'S PROFILE 


router.get("/auth/profile", isLoggedIn, (req, res, next) => {
    res.render("auth/profile")
})

// router.get("/auth/login", (req, res, next) => {
//     res.render("auth/login");
// });

module.exports = router;