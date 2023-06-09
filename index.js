const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qt86btt.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const toyCollection = client.db('toyHavenDB').collection('toys');

    app.get('/allToys', async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    })

    app.get('/toys', async (req, res) => {
      const toyCategory = req.query.category;
      console.log(toyCategory);
      const query = { category: toyCategory }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result);
    })

    app.get('/my-toys', async (req, res) => {
      const email = req.query.sellerEmail;
      const sorted = req.query.sort;

      const query = { sellerEmail: email }
      const result = await toyCollection.find(query).sort({ price: sorted }).toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      user.price = parseFloat(req.body.price)
      console.log(user);
      const result = await toyCollection.insertOne(user)
      res.send(result);
    })

    app.patch('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const { price, quantity, description } = req.body;
      console.log(price, quantity, description);
      const updateDoc = {
        $set: {
          price: parseFloat(price),
          quantity: quantity,
          description: description
        },
      };
      const options = { multi: true };

      const result = await toyCollection.updateMany(filter, updateDoc, options);
      res.send(result)
    })

    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error ..//
    //     await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('toy-haven server is running')
})

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
})