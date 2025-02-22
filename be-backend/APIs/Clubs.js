const exp=require('express')
const club=exp.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncErrorHandle = require('express-async-handler');
const {verifyToken,validateToken}=require('../MIDDLEWARES/Admin')
const {updateadminorclubororanizer, loginclubororganizer}=require('./Utils');
const { sendMessage, getMessages } = require('./messageUtils');
club.put('/update-details',verifyToken(['club']),asyncErrorHandle(updateadminorclubororanizer));
club.post('/login',asyncErrorHandle(loginclubororganizer));
club.put('/update-details',verifyToken(['club']),(req,res)=>
{
    const userType=req.user.userType;
    updateadminorclubororanizer(req,res,userType);
})
club.post('/add-organizer', verifyToken(['club']), asyncErrorHandle(async (req, res) => {
    try {
        const clubOrganisers = req.app.get('clubOrganisers');
        const clubCollections = req.app.get('clubCollections');
        
        const clubname = req.user.clubname;
        const club = await clubCollections.findOne({ clubname: clubname });
        const count = club.count;

        if (count < 5) {
            const organiser = req.body;
            organiser.username = organiser.username.toLowerCase();

            const found = await clubOrganisers.findOne({ username: organiser.username });

            if (found) {
                return res.status(400).send({ message: 'Username already exists in the database' });
            }

            const hashedPassword = await bcryptjs.hash(organiser.password, 6);
            organiser.password = hashedPassword;
            organiser.clubname = clubname;
            organiser.userType = 'organizer';
            await clubOrganisers.insertOne(organiser);

            await clubCollections.updateOne(
                { clubname: clubname },
                { $inc: { count: 1 } }
            );

            return res.status(201).send({ message: 'Organizer added successfully.' });
        } else {
            return res.send({ message: 'Maximum number of organizers exceeded.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'An error occurred while adding the organizer.' });
    }
}));

club.post('/remove-organizer', verifyToken(['club']),asyncErrorHandle(async (req, res) => {
    try {
        const clubCollections = req.app.get('clubCollections');
        const organiserCollections = req.app.get('clubOrganisers');
        const user = req.body;
        const clubname = req.user.clubname;
        const club = await clubCollections.findOne({ clubname: clubname });

        const count = club.count; 
        if(count==0)
        {
            return res.status(404).send({ message: 'no Organizer exists' });
        }
        if (count > 1) {
            const organiser = await organiserCollections.findOne({ username: user.username });
            if (!organiser) {
                return res.status(404).send({ message: 'Organizer not found.' });
            }

            await organiserCollections.deleteOne({ username: user.username });
            await clubCollections.updateOne(
                { clubname: clubname },
                { $inc: { count: -1 } }
            );

            return res.status(200).send({ message: 'Organizer removed successfully.' });
        } else {
            return res.status(400).send({ message: 'Cannot remove the last organizer.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'An error occurred while removing the organizer.' });
    }
}));

club.post('/send-message-admin', verifyToken(['club']), asyncErrorHandle(async (req, res) => {
    const messageCollections = req.app.get('messageCollections');
    const clubname = req.user.clubname;
    const adminUsername = 'admin';
    const { content } = req.body;

    try {
        const result = await sendMessage({
            sender: clubname, 
            sentby: req.user.username,
            receiver: adminUsername,
            content,
            messageCollections,
            clubname 
        });

        return res.status(201).send(result);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: error.message });
    }
}));

club.post('/get-messages', verifyToken(['club']), asyncErrorHandle(async (req, res) => {
    const sender = req.user.clubname;  
    const receiver = 'admin';  
    const messageCollections = req.app.get('messageCollections');

    try {
        const result = await getMessages({ sender, receiver }, messageCollections);  
        return res.send(result);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: error.message });
    }
}));


    
module.exports=club;