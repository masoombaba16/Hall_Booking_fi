const exp=require('express')
const publicapi=exp.Router();
const asyncErrorHandle = require('express-async-handler');
publicapi.get('/get-all-halls', asyncErrorHandle(async (req, res) => {
    try {
        const hallCollections = await req.app.get('hallCollections');
        const halls = await hallCollections.find({}).toArray();
        res.status(200).json({ success: true, halls });
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred while fetching halls', error });
    }
}));
publicapi.get('/get-all-clubs', asyncErrorHandle(async (req, res) => {
    try {
        const clubCollections = await req.app.get('clubCollections');
        const clubs = await clubCollections.find({}).toArray();
        res.status(200).json({ success: true, clubs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred while fetching clubs', error });
    }
}));
publicapi.get('/get-bookings', asyncErrorHandle(async (req, res) => {
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
  publicapi.get('/get-availability', async (req, res) => {
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

        return res.send({success: true, message: "Halls Found", data: finalResults });

    } catch (error) {
        console.error("Error fetching availability:", error);
        return res.status(500).json({ message: "An error occurred while fetching availability" });
    }
});

  
publicapi.post('/search-hall', asyncErrorHandle(async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.hallname) {
            return res.status(400).json({ message: "Hall name is required" });
        }

        const hallCollections = await req.app.get('hallCollections');
        data.hallname=data.hallname.toLowerCase();
        const found = await hallCollections.findOne({ hallname: data.hallname });

        if (!found) {
            return res.status(404).json({ message: "No Hall Found..!" });
        }

        return res.status(200).json({ message: "Hall Found", hall: found });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while searching for the hall", error });
    }
}));


module.exports=publicapi;