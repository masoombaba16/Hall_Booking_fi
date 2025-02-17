const exp = require('express');
const ExpressAsyncHandler = require('express-async-handler');
const publicApi = exp.Router();

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

        return res.send({success: true, message: "Halls Found", data: finalResults });

    } catch (error) {
        console.error("Error fetching availability:", error);
        return res.status(500).json({ message: "An error occurred while fetching availability" });
    }
}));
module.exports = publicApi;  
