const express = require('express') ;
require('dotenv').config();
const cors = require('cors'); 
const app = express() ;
const port = 5000 ;
// ------------------------------------------------

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
app.use(express.json());
// ------------------------------------------------

const dbUsername = process.env.DB_USERNAME ;
const dbPassword = process.env.DB_PASSWORD ;
const dbName = process.env.DB_NAME ;
// ------------------------------------------------

const { MongoClient, ServerApiVersion } = require('mongodb');

// const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.qtemx5j.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.qe0e7ik.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0` ;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



// ################################################################################







// routes import secton ----------------
const allMealsRoutes = require('./routes/allMeals/allMeals');
const usersRoutes = require('./routes/users/users');

client.connect()
  .then(() => {
    const db = client.db(dbName);
    allMealCollection = db.collection('meals');
     usersCollection = db.collection('users');



// Define Routes secton ---------------------------

app.get('/', (req, res) => {
  res.send('Loyal Meals is running!');
});

app.use('/all-meals', allMealsRoutes);
app.use('/users', usersRoutes(usersCollection));









// ################################################################################

    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

