const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'admin',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ---------------------------------------------------------------------------
// Pre-save hook — hash password before persisting
// ---------------------------------------------------------------------------
userSchema.pre('save', async function () {
  // Only hash if the password field was modified (or is new).
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---------------------------------------------------------------------------
// Instance method — compare a candidate password with the stored hash
// ---------------------------------------------------------------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

