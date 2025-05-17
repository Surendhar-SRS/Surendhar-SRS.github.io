const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = 'your_secret_key'; // Change this in production
const MONGO_URI = 'mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI).then(() => console.log('MongoDB connected'));

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email:    { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date
});

const User = mongoose.model('User', userSchema);

const app = express();
app.use(cors());
app.use(express.json());

// Email setup (use your own SMTP details)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',    // Replace with your email
    pass: 'your_app_password'        // Use App Password, NOT your email password
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password)
    return res.json({ success: false, msg: 'All fields required.' });

  const existing = await User.findOne({ $or: [{username}, {email}] });
  if (existing) return res.json({ success: false, msg: 'User or email exists.' });

  const hash = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10*60*1000; // 10 minutes

  await User.create({ name, username, email, password: hash, otp, otpExpires });

  // Send OTP (for demo, send to email)
  await transporter.sendMail({
    from: 'your_email@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code for SRS Tamizhan Developements: ${otp}`
  });

  res.json({ success: true, msg: 'User registered. Check your email for OTP.' });
});

// Resend OTP endpoint
app.post('/api/resend-otp', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, msg: 'No such user.' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10*60*1000;
  await user.save();

  await transporter.sendMail({
    from: 'your_email@gmail.com',
    to: email,
    subject: 'Your OTP Code (Resent)',
    text: `Your new OTP code: ${otp}`
  });

  res.json({ success: true, msg: 'OTP resent.' });
});

// OTP Verification endpoint
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, msg: 'User not found.' });
  if (user.otp !== otp || Date.now() > user.otpExpires)
    return res.json({ success: false, msg: 'Invalid or expired OTP.' });
  user.isVerified = true;
  user.otp = '';
  await user.save();
  res.json({ success: true, msg: 'OTP verified! You can now log in.' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
  });
  if (!user) return res.json({ success: false, msg: 'User not found.' });
  if (!user.isVerified) return res.json({ success: false, msg: 'Email not verified.' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ success: false, msg: 'Invalid password.' });

  const token = jwt.sign({ id: user._id, username: user.username, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ success: true, token, user: { name: user.name, username: user.username, email: user.email } });
});

// Listen
app.listen(3001, () => console.log('Server running on port 3001'));
