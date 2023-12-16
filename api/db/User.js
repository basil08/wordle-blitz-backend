import mongoose from 'mongoose';
import bcrypt from "bcrypt";

// Mongoose Model
var userSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true,
    unique: true,
    required: true,

  },
  password: {
    type: String,
    required: true,
  }
})

// Hash password before saving
userSchema.pre('save', function(next) {
  var user = this

  // If not registration
  if ( !user.isModified('password') ) return next()

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err)
    }
    user.password = hash
    next()
  })
})

// Password verification
userSchema.methods.login = function(password) {
  var user = this
  
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, result) => {
      if ( err ) { reject(err) }
      resolve()
    })
  })
}

// Export Mongoose "User" model
export default mongoose.model('User', userSchema);
