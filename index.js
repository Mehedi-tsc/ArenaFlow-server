require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_CLIENT_URI;
app.use(cors())
app.use(express.json())

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
    const database = client.db("ArenaFLow");
    const facilities = database.collection("facilities");
    const bookings = database.collection("bookings");

    app.post('/facilities', async(req, res)=>{
        const data = req.body
        const result = await facilities.insertOne(data)
        res.send(result);
        
    })
    app.post('/bookings', async(req, res)=>{
        const data = req.body
        const result = await bookings.insertOne(data)
        res.send(result);
        
    })

    app.get('/facilities', async(req, res)=>{
      const {search, filter} = req.query
      let cursor;
      if(search){
        cursor = facilities.find({
          facilityName: {
            $regex: search,
            $options: 'i',
          }
        });
      }else{
        cursor = facilities.find();
      }
      if(filter){
        cursor = facilities.find({
          facilityType: {
            $regex: filter,
            $options: 'i',
          }
        });
      }else{
        cursor = facilities.find();
      }
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/bookings', async(req, res)=>{
      const result = await bookings.find().toArray()
      res.send(result)
    })
    app.get('/bookings/:userId', async(req, res)=>{
      const id = req.params.userId
      const result = await bookings.find({userId:id}).toArray()
      res.send(result)
    })
    app.get('/facility/:id', async(req, res)=>{
      const id= req.params.id
      const query = {
        _id: new ObjectId(id)
      }
      const result = await facilities.findOne(query)
      res.send(result)
    })
    app.get('/facilities/:email', async(req, res)=>{
      const email = req.params.email
      
      const query = {
        ownerEmail: email
      }
      const result = await facilities.find(query).toArray()
      res.send(result)
    })
    app.get('/FeaturedFacilities', async(req, res)=>{
      const result = await facilities.find().limit(6).toArray()
      res.send(result)
    })
    app.delete('/bookings/:bookingId', async(req, res)=>{
      const id = req.params.bookingId
      const result = await bookings.deleteOne({_id: new ObjectId(id)})
      res.send(result)
    })
    app.delete('/facilities/:facilitiesId', async(req, res)=>{
      const id = req.params.facilitiesId
      const result = await facilities.deleteOne({_id: new ObjectId(id)})
      res.send(result)
    })
    app.patch('/facilities/:id', async(req, res)=>{
      const id = req.params.id
      const Document = req.body
      const updateDocument ={
        $set: Document
      }
      const query = {
        _id: new ObjectId(id)
      }
      const result = await facilities.updateOne(query, updateDocument)
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
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});