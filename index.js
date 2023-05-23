const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ae6qagl.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db('toyShop').collection('toys');
    const toypostCollection = client.db('toyShop').collection('toypost');

    app.get('/toys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // find single toy data
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { toy_name: 1, image: 1, category: 1, price: 1, rating: 1, available_quan: 1, description: 1 },
      };

      const result = await toyCollection.findOne(query, options);
      res.send(result);
    });


    // sub-category
    app.get('/toys/:text', async (req, res) => {
      if (req.params.text == "Dogs" || req.params.text == "Tiger" || req.params.text == "Dinosaur") {
        const result = await toyCollection.find({ category: req.params.text }).toArray();
        return res.send(result);
      }
      const result = await toyCollection.find({}).toArray();
      res.send(result);
    });

    app.get('/toypost', async (req, res) => {
      const cursor = toypostCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // delete toy
    app.delete('/toypost/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toypostCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/toypost/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toypostCollection.findOne(query);
      res.send(result);
    })

    // add Toy
    app.post('/toypost', async (req, res) => {
      const toyadd = req.body;
      // console.log(toyadd);
      const result = await toypostCollection.insertOne(toyadd);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('toys server running')
})


app.listen(port, () => {
  console.log(`toys server running on port: ${port}`)
})