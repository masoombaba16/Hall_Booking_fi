const exp = require('express');
const app = exp();
const path = require('path');
const mc = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const cors = require('cors');  
const admin = require('./APIs/Admin');
const club = require('./APIs/Clubs');
const organizer = require('./APIs/Organizer');
const Token = require('./APIs/Token');
const publicapi=require('./APIs/PublicApis');
require('dotenv').config();                                       

// CORS middleware
app.use(cors({
    origin: 'http://localhost:3100', 
    credentials: true,          
}));

// MongoDB Connection
mc.connect(process.env.DB_URL)
    .then(client => {
        const adminDB = client.db('admin');
        const clubsDB = client.db('clubs');
        const adminCollection = adminDB.collection('hallAdmin');
        const clubCollections = clubsDB.collection('clubCollections');
        const clubOrganisers = clubsDB.collection('clubOrganisers');
        const messageCollections = clubsDB.collection('messageCollections');
        const hallCollections=adminDB.collection('halls');
        const bookings=client.db('bookings');
        const hallBookings=bookings.collection("hall_bookings");
        app.set('hallBookings',hallBookings);
        app.set('hallCollections',hallCollections)
        app.set('adminCollection', adminCollection);
        app.set('clubCollections', clubCollections);
        app.set('clubOrganisers', clubOrganisers);
        app.set('messageCollections', messageCollections);
        
        console.log("Connected to Database..");
    })
    .catch(err => {
        console.log('Error at Database:', err);
    });

app.use(exp.json());
app.use(cookieParser());

app.use('/admin', admin);
app.use('/club', club);
app.use('/organizer', organizer);
app.use('/api', Token);
app.use('/public',publicapi);
app.use(exp.static(path.join(__dirname, '../admin-app/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin-app/build', 'index.html'));
});

app.use((er, req, res, next) => {
    res.send({ message: `Error Occurred: ${er.message}` });
});

const port = process.env.PORT || 6000;
app.listen(port, () => console.log(`Server is Listening on PORT :${port}...`));
