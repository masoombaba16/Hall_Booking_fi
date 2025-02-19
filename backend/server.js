const exp = require('express');
const app = exp();
const cors = require('cors');
require('dotenv').config();
app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true, 
  })
);

const nodemailer=require('nodemailer')
const mc = require('mongodb').MongoClient;
const PORT = process.env.PORT;

const publicApi = require('./public/publicApi');
const adminApi = require('./Admin/Admin');

app.use(exp.json());

app.use('/public', publicApi);
app.use('/admin', adminApi);
app.post("/send-email", async (req, res) => {
    const { name, email, message } = req.body;

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
            subject: "Thank you for contacting us!",
            text: `Hi ${name},\n\n${message}\n\nRegards,\nYour Company`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send email" });
    }
});
mc.connect(process.env.DB_URL)
    .then(client => {
        const bookings=client.db('bookings');
        const adminDB = client.db('admin');
        const hallCollections=adminDB.collection('halls');
        const hallBookings=bookings.collection('hall_bookings');
        const usersCollection=bookings.collection('usersCollection');
        app.set('hallCollections',hallCollections)
        app.set('hallBookings', hallBookings);
        app.set('usersCollection',usersCollection);
        app.listen(PORT, () => {
            console.log("Server is Listening on PORT:", PORT);
        });

        console.log("Connected to Database..");
    })
    .catch(er => console.log("Error Occurred:", er));
    app.get('/logout', (req, res) => {
        try {
          res.clearCookie('token', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
          });
      
          console.log('Logout successful');
          res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
          console.error('Unexpected error during logout:', error);
          res.status(500).json({ message: 'Internal server error during logout' });
        }
      });
      
      
      
app.use((er, req, res, next) => {
    res.status(500).json({ message: `Error Occurred: ${er.message}` });
});
