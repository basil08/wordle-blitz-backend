import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";

import { config } from 'dotenv';

config();

import mongoose from 'mongoose';
mongoose.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true }
);

import passport from "passport";
import { Strategy } from "passport-local";
import User from "./db/User.js";
import jwt from "jsonwebtoken"

// Local Strategy
passport.use("local", new Strategy(async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return done(null, false, {
                message: 'No user found.'
            })
        }

        user.login(password).then(() => {
            return done(null, user)
         }).catch((err) => {
           return done(err, false, {
             message: 'Passwords do not match!'
           })
         })

    } catch (err) {
        return done(err);
    }
   
}))

// JWT strategy 

import passportJWT  from "passport-jwt";
import GameData from './db/GameData.js';
import GameEntry from './db/GameEntry.js';
import GameResult from './db/GameResult.js';
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use("jwt-strategy", new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        return done(null, user);
    } catch(err) {
        return done(err, false, { 
            message: 'Token not matched.'
        })
    }
  }))
  

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors({ origin: "*" }))
app.use(passport.initialize());

app.use(bodyParser.json({ limit: "10mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "10mb", parameterLimit: 50000, extended: true }))

app.get("/", (req, res) => {
    res.json({ health: "ok"})
})

app.post('/signup', async (req, res) => {
    var user = new User({
      email: req.body.email,
      password: req.body.password
    })
    try {
        await user.save();
          const token = jwt.sign({id: user.id}, process.env.JWT_SECRET)
        return res.json({ user: user, token: token });
    } catch (err) {
        console.error(err);
        return res.json({ err: err });
    }
  });


  app.post('/signupmany', async (req, res) => {
      const savedUsers = [];
      if (req.body.users) {
        const users = JSON.parse(req.body.users);
        for (const u of users) {
            var user = new User({
                email: u.email,
                password: u.password
            })

        try {
            await user.save();
            savedUsers.push(user);
            // const token = jwt.sign({id: user.id}, process.env.JWT_SECRET)
        } catch (err) {
            console.error(err);
            return res.json({ err: err });
        }
    } 
    return res.json({ users: savedUsers });
    } else {
        return res.json({ err: "No users array was given!"});
    }
  })

  app.post('/saveresult', async (req, res) => {
    if (req.body.gameResult) {
      const gameResult = JSON.parse(req.body.gameResult);
      for (const gr of gameResult) {
        var gameResultObj = new GameResult({
            name: gr.name ? gr.name : "Player",
            score: gr.score,
            total: gr.total,
            wins: gr.wins,
            loses: gr.loses,
            averageTimePerSolve: gr.averageTimePerSolve,
            data: gr.data,
            email: gr.email,
            userId: gr.userId
        });

        try {
            await gameResultObj.save();
        } catch(err) {
            console.error(err);
            return res.json({ err: err });
        }
    }
    return res.json({ success: true });
  }
})

app.post('/getResult', passport.authenticate('jwt-strategy', {
    session: false
}), async (req, res) => {
    if (!req.body.userId) {
        return res.json({ msg: "Want a userId!"})
    }
    
    try {
        const gameResult = await GameResult.findOne({ userId: req.body.userId});
        return res.json(gameResult);
    } catch(err) {
        return res.json({ success: false, err: err });
    }
})

  app.post('/login', passport.authenticate('local', {
    session: false
  }),
 async (req, res, next) => {
    // make the gameEntry object
    const gameEntry = new GameEntry({
        userId: req.user._id,
        startTimeStamp: Date.now().valueOf()
    })

    await gameEntry.save();
    const token = jwt.sign({id: req.user.id}, process.env.JWT_SECRET)

    res.json({token: token})
  })

app.get('/user', passport.authenticate('jwt-strategy', {
    session: false
}), (req, res, next) => {
    if (!req.user) {
        return res.json({ error: "No user found!"});
    }

    return res.json({ user: req.user });
})

app.post('/save', passport.authenticate('jwt-strategy', {
    session: false
}), async (req, res, next) => {

    if (!req.user) {
        // TODO: log into a error object
        return res.json({ error: "No user found!"});
    }

    console.log(req.body.gameData);

    try {
        const gameData = new GameData({
            data: JSON.parse(req.body.gameData ? req.body.gameData : "[]"),
            userId: req.user._id
        });

        await gameData.save();
        return res.json({ status: 0, msg: "Your game data was successfully saved to the server! You may close this window!"})
    } catch(err) {
        console.log(err);
        return res.json({ "err": err })
    }
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})