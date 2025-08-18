// routes/users/businessAdminUsers.js
const express = require("express");
const bcrypt = require("bcrypt");

module.exports = function businessAdminUserRoutes(businessAdminUsersCollection) {
  const router = express.Router();

  // Register Business Admin ========================= 
  router.post("/register", async (req, res) => {
    try {
      const { firstName, lastName, userName, phoneNo, email, password } = req.body;

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

      // User object
      const newUser = {
        firstName,
        lastName,
        userName,
        phoneNo,
        email,
        password: hashedPassword,
        role: "businessAdmin",   
        createdAt: new Date(),
      };

      // Insert into DB
      const result = await businessAdminUsersCollection.insertOne(newUser);

      res.status(201).json({
        message: "Business Admin registered successfully",
        userId: result.insertedId,
      });
    } catch (error) {
      console.error("Error in /business-admin-users/register:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  //  Login Business Admin  =========================
  router.post("/login", async (req, res) => {
    try { 
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user exists
      const user = await businessAdminUsersCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Optional: generate JWT token
      // const token = jwt.sign(
      //   { userId: user._id, role: user.role },
      //   process.env.JWT_SECRET,
      //   { expiresIn: "1h" }
      // );

      res.status(200).json({
        message: "Login successful",
        // token, // uncomment if using JWT
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          phoneNo: user.phoneNo,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error in /business-admin-users/login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
}
