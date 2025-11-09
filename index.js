const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require("mongodb");
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
