const mongoose = require('mongoose');
const User = require('../models/User');
const keys = require('../config/keys');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.jwt
}

module.exports = passport => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.findById(payload.userId).select('email id');
        done(null, user || false);
      } catch(e) {
        console.log(e);
      }
    })
  )
}
