const exp = require('express');
const admin = exp.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncErrorHandle = require('express-async-handler');
const {verifyToken,validateToken} = require('../MIDDLEWARES/Admin');
const {updateadminorclubororanizer}=require('./Utils');
const { sendMessage, getMessages } = require('./messageUtils');
admin.post('/login', asyncErrorHandle(async (req, res) => {
    const adminCollection = req.app.get('adminCollection');
    const user = req.body;
    const dbuser = await adminCollection.findOne({ email: user.email.toLowerCase() });

    if (!dbuser) {
        return res.status(401).send({ message: "User not found" });
    }

    const pass = await bcryptjs.compare(user.password, dbuser.password);
    if (!pass) {
        return res.status(401).send({ message: "Invalid password" });
    }

    const token = jwt.sign({ username: dbuser.username, userType: dbuser.userType ,email:dbuser.email,names:dbuser.names}, 'abcd', { expiresIn: '6h' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 6 * 60 * 60 * 1000,  
        sameSite: 'Strict',
    });

    const safeUser = {
        userType: dbuser.userType,
    };

    return res.send({ message: "Login Success", token: token, user: safeUser });
}));



admin.put('/update-details', validateToken(), asyncErrorHandle(updateadminorclubororanizer));
admin.post('/get-messages', verifyToken(['admin']), asyncErrorHandle(async (req, res) => {
    const receiver = req.body.receiver.toLowerCase();
    const sender = 'admin';
    const messageCollections = req.app.get('messageCollections');

    try {
        const result = await getMessages({ sender, receiver }, messageCollections);
        return res.send(result);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}));
const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

admin.post('/add-hall', validateToken(), asyncErrorHandle(async (req, res) => {
    const data = req.body;
    const hallCollections = req.app.get('hallCollections');
    const clubCollections = await req.app.get('clubCollections'); // Fetch club collections

    data.hallname = data.hallname.toLowerCase();

    const found = await hallCollections.findOne({ hallname: data.hallname });
    if (found) {
        return res.status(400).send({ message: 'Hall already exists in the database' });
    }

    const currentDate = new Date();
    data.status = "active";
    data.createdAt = {
        date: formatDate(currentDate),
        time: formatTime(currentDate)
    };
    data.lastModified = {
        date: formatDate(currentDate),
        time: formatTime(currentDate)
    };
    data.createdBy = data.username;
    delete data.username;

    await hallCollections.insertOne(data);

    const clubs = await clubCollections.find({}).toArray();
    const emails = clubs.map(club => club.email);

    const hallDisplayName = data.hallname.charAt(0).toUpperCase() + data.hallname.slice(1);
    const emailSubject = `New Hall Available for Booking: ${hallDisplayName}`;
    const emailContent = `
        <h3>Greetings from <strong>Audi Booking, VNR VJIET</strong>!</h3>
        <p>We are excited to announce that a new hall, <strong>${hallDisplayName}</strong>, has been added to our platform and is now available for bookings. 🎉</p>
        <p>✨ <strong>Make your booking now and plan your events with ease!</strong></p>
        <p>Regards,<br><strong>Audi Booking, VNR VJIET</strong></p>
    `;

    try {
        await Promise.all(emails.map(email => sendEmails(email, emailSubject, emailContent)));

        return res.status(201).send({ message: 'Hall added successfully and notifications sent to all clubs.' });
    } catch (err) {
        console.error('Error sending emails:', err);
        return res.status(500).send({ message: 'Hall added, but some emails failed to send.' });
    }
}));

const sendEmails = async (to, subject, htmlContent) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: "Audi Booking, VNR VJIET",
        to: to,
        subject: subject,
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};

admin.put('/modify-hall', validateToken(), asyncErrorHandle(async (req, res) => {
    const data = req.body;  
    const hallCollections = req.app.get('hallCollections');
    
    if (data.hallname) {
        data.hallname = data.hallname.toLowerCase();
    }

    const hall = await hallCollections.findOne({ hallname: data.hallname });
    if (!hall) {
        return res.status(404).send({ message: 'Hall not found' });
    }

    const currentDate = new Date();
    data.lastModified = {
        date: formatDate(currentDate),  
        time: formatTime(currentDate)   
    };
    delete data.username;
    const updateResult = await hallCollections.updateOne(
        { hallname: data.hallname }, 
        { $set: data }
    );

    if (updateResult.matchedCount === 0) {
        return res.status(400).send({ message: 'Failed to update hall details' });
    }

    return res.status(200).send({ message: 'Hall details updated successfully' });
}));



admin.post('/send-club-message', verifyToken(['admin']), asyncErrorHandle(async (req, res) => {
    const message = req.body; 
    const messageCollections = req.app.get('messageCollections'); 
    message.receiver = message.receiver.toLowerCase(); 

    const clubCollections = req.app.get('clubCollections'); 
    const found = await clubCollections.findOne({ clubname: message.receiver }); 

    if (!found) {
        return res.status(404).send({ message: "No club found with the specified name" });
    }

    try {
        const result = await sendMessage({
            sender: 'admin',
            sentby:'admin',
            receiver: message.receiver,
            content: message.content,
            messageCollections
        });
        return res.send(result); 
    } catch (error) {
        return res.status(500).send({ message: error.message }); 
    }
}));

const nodemailer = require('nodemailer');
admin.post('/add-club', validateToken(), asyncErrorHandle(async (req, res) => {
    const clubCollections = await req.app.get('clubCollections'); 
    let club = req.body;
    club.clubname = club.clubname.toLowerCase();

    const clubNameExists = await clubCollections.findOne({ clubname: club.clubname });
    if (clubNameExists) {
        return res.status(400).send({ message: 'Club already exists in the database.' });
    }

    const emailExists = await clubCollections.findOne({ email: club.email });
    if (emailExists) {
        return res.status(400).send({ message: 'Email already used.' });
    }

    const hashedPassword = await bcryptjs.hash(club.password, 10);
    club.password = hashedPassword;

    club.status = "active";
    club.userType = 'club';
    club.count = 0;
    const currentDate = new Date();
    club.createdAt = {
        date: formatDate(currentDate), 
        time: formatTime(currentDate)
    };
    club.lastModified = {
        date: formatDate(currentDate),
        time: formatTime(currentDate)
    };
    club.createdBy = club.username; 

    await clubCollections.insertOne(club);

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

    const clubDisplayName = club.clubname.charAt(0).toUpperCase() + club.clubname.slice(1)+" Team.";
    const emailContent = `
Greetings ${clubDisplayName}

Welcome aboard! We are thrilled to have you join our platform. Start making bookings now and experience our seamless service.

"<i>Your future is created by what you do today, not tomorrow.</i>" – Robert Kiyosaki.

To set up your password, please visit http://localhost:3000. On the login page, click on 'Forgot Password' and follow the instructions to set up your new password.

Happy Booking!

Regards,  
Audi Booking, VNR VJIET
`;

    const mailOptions = {
        from: "Audi Booking,VNR VJIET",
        to: club.email,
        subject: `Welcome to our VNR VJIET Booking Platform - ${club.clubname.toUpperCase()}`,
        text: emailContent,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).send({ message: `${clubDisplayName} added successfully and confirmation email sent.` });
}));

admin.put('/block-club', validateToken(), asyncErrorHandle(async (req, res) => {
    const clubCollections = await req.app.get('clubCollections');
    const club = req.body;
    club.clubname = club.clubname.toLowerCase();

    const found = await clubCollections.findOne({ clubname: club.clubname });
    if (!found) {
        return res.status(404).send({ message: "No club found" });
    }

    const currentDate = new Date();
    club.lastModified = {
        date: formatDate(currentDate),
        time: formatTime(currentDate)
    };

    const result = await clubCollections.updateOne(
        { clubname: club.clubname },
        { $set: { status: "blocked", lastModified: club.lastModified } }
    );

    if (result.modifiedCount > 0) {
        const emailContent = `
Greetings ${club.clubname.charAt(0).toUpperCase() + club.clubname.slice(1)} Club,

We would like to inform you that your club has been blocked from making further bookings on our platform.

To resolve this issue and regain booking privileges, please approach:
Ramesh Babu Sir,  
Head of Transport Department,  
VNR VJIET Hall Bookings Admin.

Regards,  
Audi Booking, VNR VJIET
        `;

        await sendEmail(found.email, 'Club Blocked Notification', emailContent);
        return res.status(200).send({ message: "Club blocked successfully and email sent." });
    } else {
        return res.status(500).send({ message: "Failed to block the club." });
    }
}));

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',  // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USER,        // Your email
        pass: process.env.EMAIL_PASS,           // App password from Gmail (not your regular email password)
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: "Audi Booking,VNR VJIET", 
            to: to,                
            subject: subject,      
            text: text             
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent: ' + info.response);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};



admin.put('/unblock-club', validateToken(), asyncErrorHandle(async (req, res) => {
    const clubCollections = await req.app.get('clubCollections');
    const club = req.body;
    club.clubname = club.clubname.toLowerCase();
    const found = await clubCollections.findOne({ clubname: club.clubname });
    if (!found) {
        return res.status(404).send({ message: "No club found" });
    }
    const currentDate = new Date();
    club.lastModified = {
        date: formatDate(currentDate),   
        time: formatTime(currentDate)  
    };
    const result = await clubCollections.updateOne(
        { clubname: club.clubname }, 
        { $set: { status: "active",lastModified:club.lastModified } } 
    );
    return res.status(200).send({ message: "Club Unblocked successfully" });
}));

module.exports = admin;

