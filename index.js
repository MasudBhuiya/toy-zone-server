const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n2defbf.mongodb.net/?retryWrites=true&w=majority`;

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

    const toysCollection = client.db('toysdb').collection('toys')


    //get all toys data
    app.get('/toys', async(req, res)=>{
      const cursor = toysCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    //get single data
    app.get('/toys/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    //post/create data
    app.post('/toys', async(req, res)=>{
      const addToys = req.body;
      const result = await toysCollection.insertOne(addToys);
      res.send(result)
    })

    //get my data by email
    app.get('/mytoys', async(req, res)=>{
      console.log(req.query?.email)
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result)
    })


    //get data by name
    const indexKeys = {name: 1};
    const indexOptions = {name: 'name'};
    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get('/toySearch/:text', async(req, res)=>{
      const searchText = req.params.text;
      const result = await toysCollection.find({
        $or: [
          {name: {$regex: searchText, $options: 'i'}}
        ]
      }).toArray();
      res.send(result)
    });


    //delete data
    app.delete('/toys/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.deleteOne(query);
      res.send(result)
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
    res.send('Hello World!')
  })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

