const express = require("express");
// const multer = require("multer");
// const path = require("path");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: ["http://localhost:5173", "https://driveease1.netlify.app"],

    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  // console.log(" token inside the verify token", token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  // verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};
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
    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    const allCarsCollection = client.db("assignment11").collection("all-cars");
    const allBookingCollection = client
      .db("assignment11")
      .collection("all-bookings");
    // auth related apis
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",

          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",

          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
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
    app.patch("/all-cars/:id", async (req, res) => {
      const id = req.params.id;
      const query2 = { CarId: id };

      const query = { _id: new ObjectId(id) };

      const { bookingStatus } = req.body;
      const update = {
        $inc: { bookingCount: 1 },
        $set: { bookingStatus },
      };
      const update2 = {
        $inc: { bookingCount: 1 },
        $set: { bookingStatus },
      };

      const result = await allCarsCollection.updateOne(query, update);
      const result2 = await allBookingCollection.updateOne(query2, update2);
      res.send(result);
    });

    app.get("/all-bookings/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email };
      // console.log(req.user.email);
      // console.log(req.params.email);
      // if (req.user.email !== req.params.email) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }
      const result = await allBookingCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/all-cars/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await allCarsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/my-cars/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { addedBy: email };

      // console.log(req.cookies.token);
      // console.log(req.user.email);
      // console.log(req.params.email);
      // if (req.user.email !== req.params.email) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }
      const result = await allCarsCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/my-cars/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await allCarsCollection.deleteOne(query);
      res.send(result);
    });
    app.patch("/my-cars/:id", async (req, res) => {
      const id = req.params.id;
      const updateCarData = req.body;

      const query = { _id: new ObjectId(id) };
      const result = await allCarsCollection.updateOne(query, {
        $set: {
          carModel: updateCarData.carModel,
          dailyRentalPrice: updateCarData.dailyRentalPrice,
          availability: updateCarData.availability,
          description: updateCarData.description,
          vehicleRegistrationNumber: updateCarData.vehicleRegistrationNumber,

          imageURL: updateCarData.images,
          features: updateCarData.features,
          location: updateCarData.location,
        },
      });
      res.send(result);
    });

    app.patch("/updateStatus/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await allBookingCollection.updateOne(query, {
        $set: {
          bookingStatus: "Cancelled",
        },
      });

      res.send(result);
    });
    app.patch("/updateAvailableBookingCount/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const query2 = { CarId: id };
      const update = {
        $inc: { bookingCount: -1 },
        $set: { bookingStatus: "Cancelled" },
      };
      const update2 = {
        $inc: { bookingCount: -1 },
        $set: { bookingStatus: "Cancelled" },
      };

      const result = await allCarsCollection.updateOne(query, update);
      const result2 = await allBookingCollection.updateOne(query2, update2);

      res.send(result);
    });

    app.patch("/updateBooking/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBooking = req.body;

      const booking = {
        $set: {
          startDate: updatedBooking.startDate,
          endDate: updatedBooking.endDate,
        },
      };

      try {
        const result = await allBookingCollection.updateOne(
          filter,
          booking,
          options
        );
        res.send(result);
      } catch (err) {
        console.error("Error updating booking:", err);
        res.status(500).send("Error updating booking");
      }
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
