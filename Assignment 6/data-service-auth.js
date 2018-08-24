const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": {
        type: String,
        unique: true },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }],
},
    {versionKey: false}
);

let User;

module.exports.initialize = function() {
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection("mongodb://cle15:ds121331@ds121331.mlab.com:21331/cle15_web322_a6",
        {useNewUrlParser: true});

        db.on('error', function(err) {
            reject(err);
        });
        db.once('open', function() {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise(function(resolve, reject) {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            var newUser = new User(userData);
            bcrypt.genSalt(10, function(err, salt) { // Generate a "salt" using 10 rounds
                bcrypt.hash(userData.password, salt, function(err, hash) { // encrypt the password: "myPassword123"
                    // TODO: Store the resulting "hash" value in the DB
                    if (err) {
                        reject("There was an error encrypting the password");
                    } else {
                        userData.password = hash;
                        newUser.save()
                        .then(function() {
                            resolve();
                        })
                        .catch(function(err) {
                            if (err.code == 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: " + err);
                            }
                        })
                    }
                });
            });
        }
    })
}

module.exports.checkUser = function(userData) {
    return new Promise(function(resolve, reject) {
        User.find({
            userName: userData.userName
        })
        .exec()
        .then(function(user) {
            bcrypt.compare(userData.password, user[0].password)
            .then((res) => {
                // res === true if it matches and res === false if it does not match
                user[0].loginHistory.push({
                    dateTime: (new Date()).toString(),
                    userAgent: userData.userAgent
                })
                User.update({
                    userName: user[0].userName,
                    $set: 
                        { loginHistory: user[0].loginHistory },
                    multi: false 
                })
                .exec()
                .then(function() {
                    resolve(user);
                })
                .catch(function(err) {
                    reject("There was an error verifying the user: " + err);
                })
            })
            .catch(function(err) {
                reject("Incorrect Password for user: " + userData.userName);
            })
        })
        .catch(function(err) {
            reject("Unable to find user: " + userData.user);
        })   
    })
}
