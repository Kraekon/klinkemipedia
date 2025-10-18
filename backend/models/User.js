const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot be more than 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters']
      // TODO: Add password hashing with bcrypt before saving
    },
    role: {
      type: String,
      enum: ['user', 'contributor', 'admin'],
      default: 'user'
    },
    profile: {
      firstName: {
        type: String,
        trim: true
      },
      lastName: {
        type: String,
        trim: true
      },
      specialty: {
        type: String,
        trim: true
      },
      institution: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

module.exports = mongoose.model('User', UserSchema);
