const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const updateadminorclubororanizer = async (req, res) => {
    try {
        const user = req.body;
        const username = req.user.username; 
        const userType = req.user.userType; 
        let collection;
        
        if (userType === 'admin') {
            collection = req.app.get('adminCollection');
        } else if (userType === 'club') {
            collection = req.app.get('clubCollections');
        } else if (userType === 'organizer') {
            collection = req.app.get('clubOrganisers');
        } else {
            return res.status(400).send({ message: "Invalid user type" });
        }

        const dbuser = await collection.findOne({ username });
        if (!dbuser) {
            return res.status(404).send({ message: "User not found" });
        }

        const isMatch = await bcryptjs.compare(user.oldPassword, dbuser.password);
        if (!isMatch) {
            return res.status(400).send({ message: "Old password is incorrect" });
        }

        const hashedPassword = await bcryptjs.hash(user.newPassword, 10);

        await collection.updateOne({ username }, { $set: { password: hashedPassword } });

        const token = jwt.sign(
            {
                username: dbuser.username,
                userType: dbuser.userType,
                clubname: dbuser.clubname,
            },
            'abcd', 
            { expiresIn: '1h' } 
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000,
            sameSite: 'Strict',
        });

        const { password: _, ...userWithoutPassword } = dbuser;

        return res.status(200).send({
            message: "Password updated successfully",
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const loginclubororganizer = async (req, res) => {
    try {
        const user = req.body;
        const clubCollections = req.app.get('clubCollections');
        const clubOrganisers = req.app.get('clubOrganisers');

        let collection;
        if (user.userType === 'club') {
            collection = clubCollections;
        } else if (user.userType === 'organizer') {
            collection = clubOrganisers;
        } else {
            return res.status(400).send({ message: "Invalid user type" });
        }

        const dbuser = await collection.findOne({ username:user.username });
        
        if (!dbuser) {
            return res.status(404).send({ message: "User not found" });
        }

        const passMatch = await bcryptjs.compare(user.password, dbuser.password);
        if (!passMatch) {
            return res.status(401).send({ message: "Invalid password" });
        }

        const club = await clubCollections.findOne({ clubname: dbuser.clubname });
        if (club && club.status === 'blocked') {
            return res.status(403).send({
                message: `Your club ${club.clubname} has been blocked. Please contact the admin for more information.`,
            });
        }

        const token = jwt.sign(
            {
                username: dbuser.username,
                userType: dbuser.userType,
                clubname: dbuser.clubname,
            },
            'abcd', // secret key (keep it safe)
            { expiresIn: '6h' } // token expiry time
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 6*60 * 60 * 1000, 
            sameSite: 'Strict',
        });

        const { password: _, ...userWithoutPassword } = dbuser;

        return res.status(200).send({
            message: "Login successful",
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = { updateadminorclubororanizer, loginclubororganizer };
