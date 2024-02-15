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

    const toysCollection = client.db('toysdb').collection('toys')
    const bottleCollection = client.db('toysdb').collection('bottles')

    //get all toys data
    app.get('/toys', async(req, res)=>{
      const sort = req.query.sort;
      console.log(sort)
      const query = {};
      const options = {
        sort: {
          "price": sort === 'asc' ? 1 : -1
        }
      }
      const limit = parseInt(req.query.limit) || 20;
      const result = await toysCollection.find(query, options).limit(limit).toArray()
      res.send(result)
    })

    //get single data
    app.get('/toys/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.findOne(query);
      res.send(result);
    });


    //normal get bottles
    app.get('/bottles', async(req, res)=>{
      const cursor = bottleCollection.find()
      const result = await cursor.toArray();
      res.send(result)
  })

  //post bottle
  app.post('/bottles', async(req, res)=>{
    const bottle = req.body;
    console.log('new user', bottle);
    const result = await bottleCollection.insertOne(bottle);
    res.send(result);
});

//delete bottle
app.delete('/bottles/:id', async(req, res)=>{
  const id = req.params.id;
  console.log('please delete from database', id);
  const query = {_id: new ObjectId(id)}
  const result = await bottleCollection.deleteOne(query);
  res.send(result)
})

    //post/create data
    app.post('/toys', async(req, res)=>{
      const addToys = req.body;
      const result = await toysCollection.insertOne(addToys);
      res.send(result)
    })



    //get my data by email
    app.get('/mytoys', async(req, res)=>{
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result)
    })

    //sorting
    


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


    //update toys data
    app.put('/toys/:id', async(req, res)=>{
      const id = req.params.id;
      const update  = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const toys = {
        $set: {
          price: update.price,
          quantity: update.quantity,
          details: update.details,
        }
      }
      const result = await toysCollection.updateOne(filter, toys, options);
      res.send(result)
    })





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

