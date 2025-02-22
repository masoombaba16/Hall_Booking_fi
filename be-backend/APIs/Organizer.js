const exp = require('express');
const organizer = exp.Router();
const asyncErrorHandle = require('express-async-handler');
const { loginclubororganizer, updateadminorclubororanizer } = require('./Utils');
const {verifyToken,validateToken} = require('../MIDDLEWARES/Admin');
const { sendMessage, getMessages, createThread } = require('./messageUtils');

// Function to get formatted timestamp
function getFormattedTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

// Route for updating details
organizer.put('/update-details', verifyToken(['organizer']), asyncErrorHandle(updateadminorclubororanizer));

// Route for login
organizer.post('/login', asyncErrorHandle(loginclubororganizer));

// Route for sending a message to the admin
organizer.post('/send-message-admin', verifyToken(['organizer']), asyncErrorHandle(async (req, res) => {
    const messageCollections = req.app.get('messageCollections');
    const clubname = req.user.clubname;
    const adminUsername = 'admin'; // Admin identifier
    const { content } = req.body; // Message content from request body

    try {
        // Check if a conversation exists between the club and admin (based on sender and receiver)
        const existingThread = await messageCollections.findOne({
            $or: [
                { sender: clubname, receiver: adminUsername },
                { sender: adminUsername, receiver: clubname }
            ]
        });

        // If no existing thread, create a new thread ID
        let threadId = existingThread ? existingThread.threadId : await createThread(clubname, adminUsername, messageCollections);

        // Send message (create new message entry in the thread)
        const result = await sendMessage({
            sender: clubname,
            sentby: req.user.username,
            receiver: adminUsername,
            content,
            messageCollections,
            threadId, // Use the threadId to relate the messages
            clubname
        });

        return res.status(201).send(result);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: error.message });
    }
}));

// Route to get messages in a conversation
organizer.post('/get-messages', verifyToken(['organizer']), asyncErrorHandle(async (req, res) => {
    const messageCollections = req.app.get('messageCollections');
    const sender = req.user.clubname; // Ensure `req.user` has `clubname`
    const receiver = 'admin'; // Default to admin if not specified

    try {
        // Retrieve messages from the conversation thread
        const result = await getMessages({ sender, receiver }, messageCollections);
        return res.send(result);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: error.message });
    }
}));

module.exports = organizer;
