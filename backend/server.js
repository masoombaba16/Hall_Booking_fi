const exp = require('express');
const app = exp();
const cors = require('cors');
require('dotenv').config();
app.use(cors('*'));

const mc = require('mongodb').MongoClient;
const PORT = process.env.PORT;

const publicApi = require('./public/publicApi');
const adminApi = require('./Admin/Admin');

app.use(exp.json());

app.use('/public', publicApi);
app.use('/admin', adminApi);

mc.connect(process.env.DB_URL)
    .then(client => {
        const bookings=client.db('bookings');
        const adminDB = client.db('admin');
        const hallCollections=adminDB.collection('halls');
        const hallBookings=bookings.collection('hall_bookings');
        app.set('hallCollections',hallCollections)
        app.set('hallBookings', hallBookings);
        app.listen(PORT, () => {
            console.log("Server is Listening on PORT:", PORT);
        });

        console.log("Connected to Database..");
    })
    .catch(er => console.log("Error Occurred:", er));

app.use((er, req, res, next) => {
    res.status(500).json({ message: `Error Occurred: ${er.message}` });
});
