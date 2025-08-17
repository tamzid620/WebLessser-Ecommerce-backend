// users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = function (usersCollection) {
  const router = express.Router();

  // MIDDLEWARE
  const verifyJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send({ message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).send({ message: 'Forbidden' });
      req.user = decoded;
      next();
    });
  };

  // SIGNUP
  router.post('/signup', async (req, res) => {
    const { userName, email, password, role = "user" } = req.body;
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({
      userName,
      email,
      password: hashedPassword,
      role
    });

    const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '15d' });

    res.send({ message: 'Account Created Successfully', token });
  });

  // LOGIN
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email });

    if (!user) return res.status(400).send({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Invalid credentials' });

    const token = jwt.sign({ email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15d' });
    res.send({ message: 'Login successful', token, role: user.role  });
  });

  // PROTECTED ROUTE
  router.get('/profile', verifyJWT, (req, res) => {
    res.send({ message: 'You are authorized', user: req.user });
  });

  return router;
};
