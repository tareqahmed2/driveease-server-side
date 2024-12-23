const express = require("express");
// const multer = require("multer");
// const path = require("path");
const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());

app.use(express.json());
// const upload = multer({ dest: "uploads/" });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0sbt0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const allCarsCollection = client.db("assignment11").collection("all-cars");
    const allBookingCollection = client
      .db("assignment11")
      .collection("all-bookings");
    app.get("/", async (req, res) => {
      res.send("assignment 11 is running");
    });
    app.post("/all-cars", async (req, res) => {
      const newCar = req.body;
      const result = await allCarsCollection.insertOne(newCar);
      res.send(result);
    });
    app.post("/all-bookings", async (req, res) => {
      const newCar = req.body;

      const result = await allBookingCollection.insertOne(newCar);
      res.send(result);
    });
    app.get("/all-cars", async (req, res) => {
      const query = {};
      const result = await allCarsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/all-bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await allBookingCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/all-cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allCarsCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/deleteBooked/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await allBookingCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`assignment is getting warmer in port: ${port}`);
});
