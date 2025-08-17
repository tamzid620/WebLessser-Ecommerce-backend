const express = require('express');
const router = express.Router();

    router.get('/', async (req, res) => {
      try {
        const data = await allMealCollection.find().toArray();
        res.json(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
      }
    });

module.exports = router;

