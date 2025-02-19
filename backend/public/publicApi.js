const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const ExpressAsyncHandler = require('express-async-handler');
const publicApi = express.Router();

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

publicApi.use(cookieParser()); 

publicApi.get('/get-bookings', ExpressAsyncHandler(async (req, res) => {
  try {
    const hallBookings = await req.app.get('hallBookings').find().toArray();
    if (hallBookings.length === 0) {
      return res.send({ message: "No bookings found" });
    }
    res.status(200).json({ success: true, hallBookings });
  } catch (error) {
    return res.status(500).send({ message: "An error occurred", error: error.message });
  }
}));

publicApi.get('/get-availability', ExpressAsyncHandler(async (req, res) => {
  try {
    const halls = await req.app.get('hallCollections').find({ status: "active" }).toArray();
    const hallNames = halls.map(hall => hall.hallname);

    const hallBookings = await req.app.get('hallBookings').find({
      hall_name: { $in: hallNames }
    }).toArray();

    const bookedHallNames = hallBookings.map(hall => hall.hall_name);
    const unbookedHalls = halls
      .filter(hall => !bookedHallNames.includes(hall.hallname))
      .map(hall => ({
        hall_name: hall.hallname,
        bookings: [
          { slot: "FN", status: "available" },
          { slot: "AN", status: "available" }
        ]
      }));

    const finalResults = [...hallBookings, ...unbookedHalls];

    return res.send({ success: true, message: "Halls Found", data: finalResults });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return res.status(500).json({ message: "An error occurred while fetching availability" });
  }
}));

publicApi.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersCollection = req.app.get("clubCollections");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    // Remove password from user object before sending
    const { password: _, ...userData } = user; // Exclude password

    // Generate JWT token with userData
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: "1h" });

    // Set secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600 * 1000, // 1 hour
    });

    res.json({
      message: "Login successful",
      success: true,
      token,
      user: userData, // Send full user data except password
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
});

const nodemailer = require('nodemailer'); 

publicApi.post('/register', ExpressAsyncHandler(async (req, res) => {
  try {
    const data = req.body;
    const clubCollections = req.app.get('clubCollections');

    const found = await clubCollections.findOne({
      $or: [{ email: data.email }, { clubname: data.clubname }]
    });
        if (found) {
      return res.status(400).json({ message: "Club or Email already exists.", success: false });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password=hashedPassword;
    const userType="club";
    data.userType=userType;
    const done = await clubCollections.insertOne(data);

    if (done.acknowledged) {
      await sendConfirmationEmail(data.clubname, data.email);

      return res.status(201).json({ message: "Registered successfully. A confirmation email has been sent.", success: true });
    } else {
      return res.status(500).json({ message: "Registration failed", success: false });
    }
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ message: "An error occurred", success: false, error: error.message });
  }
}));

const sendConfirmationEmail = async (name, email) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${name} Registration Successful..`,
      text: `Welcome ${name},\n\nThank you for Creating Account with us! Your account has been successfully created.Book your Event Halls Now on our Website.\n\nRegards,\nAudi Booking,VNR VJIET.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent to:", email);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

publicApi.post("/forgot-password", ExpressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const clubCollections = req.app.get("clubCollections");

  const user = await clubCollections.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Email not registered.", success: false });
  }

  const otp = ("" + Math.floor(1000 + Math.random() * 9000));
  const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await clubCollections.updateOne(
    { email },
    { $set: { resetOTP: otp, otpExpiration } }
  );

  await sendOTPEmail(email, otp);
  res.json({ message: "OTP sent to registered email.", success: true });
}));

publicApi.post("/verify-otp", ExpressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const clubCollections = req.app.get("clubCollections");

  const user = await clubCollections.findOne({ email });
  if (!user || user.resetOTP !== otp) {
    return res.status(400).json({ message: "Invalid OTP.", success: false });
  }

  if (new Date() > new Date(user.otpExpiration)) {
    return res.status(400).json({ message: "OTP has expired.", success: false });
  }

  res.json({ message: "OTP verified. Proceed to reset password.", success: true });
}));
const sendPasswordResetConfirmationEmail = async (name, email) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Changed Successfully",
      text: `Hello ${name},\n\nYour password has been successfully Changed. If you did not perform this action, please contact our support immediately.\n\nRegards,\nAudi Booking, VNR VJIET.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset confirmation email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset confirmation email:", error);
  }
};

publicApi.post("/change-password", ExpressAsyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  const clubCollections = req.app.get("clubCollections");

  const user = await clubCollections.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email.", success: false });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await clubCollections.updateOne(
    { email },
    { $set: { password: hashedPassword }, $unset: { resetOTP: "", otpExpiration: "" } }
  );

  // ✅ Send password reset confirmation email
  await sendPasswordResetConfirmationEmail(user.clubname, email);

  res.json({ message: "Password changed successfully. A confirmation email has been sent. Login Now to Access", success: true });
}));



publicApi.get('/validate-token', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided', success: false });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token', success: false });
    }
    res.json({
      message: 'Token is valid',
      success: true,
      user: decoded, 
    });
  });
});


module.exports = publicApi;
  