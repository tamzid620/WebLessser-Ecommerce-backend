const express = require('express');

module.exports = function (superAdminUsersCollection) {
  const router = express.Router();

  // Health check / test route
  router.get('/', (req, res) => {
    res.send({ message: 'Super Admin Users API is running!' });
  });

  // Get all super admin users
  router.get('/all', async (req, res) => {
    try {
      const users = await superAdminUsersCollection.find({}).toArray();
      res.status(200).send(users);
    } catch (error) {
      console.error('Error fetching super admin users:', error);
      res.status(500).send({ message: 'Server error' });
    }
  });

  // LOGIN (plain text password check since your DB stores plain password)
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required' });
      }

      // Find user in DB
      const user = await superAdminUsersCollection.findOne({ email });
      if (!user) {
        return res.status(400).send({ message: 'Invalid credentials' });
      }

      // Compare plain text password
      if (password !== user.password) {
        return res.status(400).send({ message: 'Invalid credentials' });
      }

      // Exclude password from response
      const { password: _, ...safeUser } = user;

      res.status(200).send({
        message: 'Login successful',
        user: safeUser
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send({ message: 'Server error' });
    }
  });

  return router;
};
