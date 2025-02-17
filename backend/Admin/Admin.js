const exp = require('express');
const ExpressAsyncHandler = require('express-async-handler');
const adminApi = exp.Router();

// Example route to test
adminApi.get('/info', ExpressAsyncHandler(async (req, res) => {
    res.json({ message: "Public API working!" });
}));

module.exports = adminApi;  // ✅ Ensure proper export
