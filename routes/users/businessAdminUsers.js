// routes/users/businessAdminUsers.js
const express = require("express");
const bcrypt = require("bcrypt");

module.exports = function businessAdminUserRoutes(businessAdminUsersCollection) {
    const router = express.Router();


    // Health check / test route
    router.get('/', (req, res) => {
        res.send({ message: 'Super Admin Users API is running!' });
    });

    // all Business Admin ========================= 
    router.get('/all-business-admin', async (req, res) => {
        try {
            const users = await businessAdminUsersCollection.find({}).toArray();
            res.status(200).send(users);
        } catch (error) {
            console.error('Error fetching business admin users:', error);
            res.status(500).send({ message: 'Server error' });
        }
    });

    // Register Business Admin ========================= 
    router.post("/register", async (req, res) => {
        const { firstName, lastName, userName, phoneNo, email, password,  subDomain } = req.body;

        // Basic validation
        if (!firstName || !lastName || !userName || !phoneNo || !email || !password ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await businessAdminUsersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Subdomain handling 
        const newSubDomain = subDomain && subDomain.trim() !== ""
            ? subDomain
            : "example";
        
        // User object
        const newUser = {
            firstName,
            lastName,
            userName,
            phoneNo,
            email,
            password: hashedPassword,
            role: "businessAdmin",
            subDomain: `http://${newSubDomain}${".localhost:5173"}`,
            createdAt: new Date(),
        };

        // Insert into DB
        const result = await businessAdminUsersCollection.insertOne(newUser);

        res.status(201).json({
            message: "Business Admin registered successfully",
            userId: result.insertedId,
        });

    });

    //  Login Business Admin  =========================
    router.post("/login", async (req, res) => {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }


        const user = await businessAdminUsersCollection.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",

            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email,
                phoneNo: user.phoneNo,
                role: user.role,
                subDomain: user.subDomain,
            },
        });

    });

    return router;
}
