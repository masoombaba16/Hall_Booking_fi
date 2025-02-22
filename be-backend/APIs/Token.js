const express = require("express");
const router = express.Router();
const { verifyToken, validateToken } = require("../MIDDLEWARES/Admin");

// Route to verify token for Admin, Club, and Organizer
router.get("/verify-token", verifyToken(["admin", "club", "organizer"]), (req, res) => {
    const { userType, username, email, names, token } = req.user;
    res.send({ valid: true, user: { userType, username, email, names, token } }); 
});

module.exports = router;
