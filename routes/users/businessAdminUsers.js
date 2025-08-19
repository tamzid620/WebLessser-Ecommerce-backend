// routes/users/businessAdminUsers.js
const express = require("express");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");


module.exports = function businessAdminUserRoutes(businessAdminUsersCollection) {
    const router = express.Router();


    // Health check / test route
    router.get('/', (req, res) => {
        res.send({ message: 'Super Admin Users API is running!' });
    });

    // Register Business Admin ========================= 
    router.post("/register", async (req, res) => {
        const { firstName, lastName, userName, phoneNo, email, password, subDomain } = req.body;

        // Basic validation
        if (!firstName || !lastName || !userName || !phoneNo || !email || !password) {
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
            product: [],
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

    // Add product Business Admin =========================
    router.post("/add-product/:id", async (req, res) => {
        const { id } = req.params;
        const { title, description, price, warranty } = req.body;

        if (!title || !description || !price || !warranty) {
            return res.status(400).json({ message: "All fields are required" });
        }

        try {
            const newProduct = {
                id: new ObjectId(), 
                title,
                description,
                price: parseFloat(price),
                warranty,
            };

            const result = await businessAdminUsersCollection.updateOne(
                // { _id: new require("mongodb").ObjectId(id) },
                { _id: new ObjectId(id) },
                { $push: { product: newProduct } }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).json({ message: "User not found or product not added" });
            }

            res.status(200).json({ message: "Product added successfully", product: newProduct });
        } catch (error) {
            console.error("Error adding product:", error);
            res.status(500).json({ message: "Server error" });
        }
    });

    // get single product Business Admin =========================
router.get('/:_id', async (req, res) => {
    const { _id } = req.params;

    if (!ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        const user = await businessAdminUsersCollection.findOne({ _id: new ObjectId(_id) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: "Server error" });
    }
});



    return router;
}



