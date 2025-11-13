const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.get("/", (req, res) => {
  res.send("Hello world");
});
require("dotenv").config();
// console.log(process.env);

//middleware
app.use(cors());
app.use(express.json());

//simpleArtworks
//cqBWotPooDyKcBTx

// const uri =
//   "mongodb+srv://simpleArtworks:cqBWotPooDyKcBTx@flash0.nw85ito.mongodb.net/?appName=Flash0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@flash0.nw85ito.mongodb.net/?appName=Flash0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // await client.connect();

    const db = client.db("art-db");
    const artsCollection = db.collection("arts");
    const favoritesCollection = db.collection("favorites");

    //get
    app.get("/artworks", async (req, res) => {
      const cursor = artsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //post
    app.post("/artworks", async (req, res) => {
      const newArt = req.body;
      const result = await artsCollection.insertOne(newArt);
      res.send({
        success: true,
        result,
      });
    });

    //specific card details
    app.get("/artworks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artsCollection.findOne(query);
      res.send({
        success: true,
        result,
      });
    });

    //update
    app.put("/artworks/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };
      const result = await artsCollection.updateOne(query, update);
      res.send(result);
    });

    //Delete
    app.delete("/artworks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artsCollection.deleteOne(query);
      res.send({
        success: true,
        result,
      });
    });

    //Featured-Artworks
    app.get("/featured-artworks", async (req, res) => {
      const result = await artsCollection
        .find({ visibility: "public" })
        .sort({ createdAt: "desc" })
        .limit(6)
        .toArray();
      res.send(result);
    });

    //best-artist
    app.get("/best-artists", async (req, res) => {
      const result = await artsCollection.find().limit(3).toArray();
      res.send(result);
    });

    //most liked
    app.get("/most-liked", async (req, res) => {
      const result = await artsCollection
        .find()
        .sort({ likes: "desc" })
        .limit(4)
        .toArray();
      res.send(result);
    });

    app.get("/banner", async (req, res) => {
      const result = await artsCollection
        .find()
        .sort({ dimensions: "desc" })
        .limit(3)
        .toArray();
      res.send(result);
    });

    //my-galleries
    app.get("/my-galleries", async (req, res) => {
      const email = req.query.email;

      const result = await artsCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });
    //public artworks
    app.get("/public-artworks", async (req, res) => {
      const categoryQuery = req.query.category;
      // const result = await artsCollection
      //   .find({ visibility: "public" })
      //   .toArray();
      let query = { visibility: "public" };

      if (categoryQuery && categoryQuery !== "All") {
        query.category = { $regex: categoryQuery, $options: "i" };
      }

      const result = await artsCollection.find(query).toArray();
      res.send(result);
    });

    //favorites
    app.post("/favorites/:id", async (req, res) => {
      const data = req.body;

      const result = await favoritesCollection.insertOne(data);
      res.send(result);
    });

    //get favorites
    app.get("/my-favorites", async (req, res) => {
      const email = req.query.email;

      const result = await favoritesCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    app.delete("/my-favorites/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoritesCollection.deleteOne(query);
      res.send(result);
    });

    //search
    app.get("/search", async (req, res) => {
      const search_text = req.query.search;
      const result = await artsCollection
        .find({ title: { $regex: search_text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    //likes
    // likes - increment only
    app.patch("/artworks/:id/like", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = { $inc: { likes: 1 } };

      const result = await artsCollection.updateOne(filter, update);
      const updatedArt = await artsCollection.findOne(filter);
      res.send({ success: true, updatedArt });
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, (req, res) => {
  console.log(`port is running ${port}`);
});
