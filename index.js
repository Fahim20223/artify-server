const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.get("/", (req, res) => {
  res.send("Hello world");
});

//middleware
app.use(cors());
app.use(express.json());

//simpleArtworks
//cqBWotPooDyKcBTx

const uri =
  "mongodb+srv://simpleArtworks:cqBWotPooDyKcBTx@flash0.nw85ito.mongodb.net/?appName=Flash0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("art-db");
    const artsCollection = db.collection("arts");

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
      res.send(result);
    });

    //Featured-Artworks
    app.get("/featured-artworks", async (req, res) => {
      const result = await artsCollection
        .find()
        .sort({ createdAt: "desc" })
        .limit(6)
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
      const result = await artsCollection
        .find({ visibility: "public" })
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
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
