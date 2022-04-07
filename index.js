const express = require('express');

const app = express();

const cors = require('cors');


const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cetyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
      await client.connect();
      const database = client.db("newWebServer");

      const productCollection = database.collection("products");
      const orderCollection = database.collection("orders");
      const usersCollection = database.collection("users");

      // food section
      // post api
      app.post("/products", async (req, res) => {
        const cursor = req.body;
        const result = await productCollection.insertOne(cursor);
        res.send(result);
      });

      // get food api
      app.get("/products", async (req, res) => {
        const cursor = productCollection.find({});
        const foods = await cursor.toArray();
        res.send(foods);
      });

      // single data
      app.get("/products/:id", async (req, res) => {
        const foodId = req.params.id;
        const query = { _id: ObjectId(foodId) };
        const food = await productCollection.findOne(query);
        res.send(food);
      });

      // Update Product Data
      app.put("/products/:id", async (req, res) => {
        const updateProduct = req.body;
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const option = { upsert: true };
        const updateDoc = { $set: { updateProduct } };
        const result = await productCollection.updateOne(
          query,
          updateDoc,
          option
        );
        res.json(result);
      });

      // delete
      app.delete("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const deleteFood = await productCollection.deleteOne(query);
        res.send(deleteFood);
      });

      // Order Section
      // post order
      app.post("/orders", async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.json(result);
      });

      // get order by email
      app.get("/orders/:email", async (req, res) => {
        const email = req.params.email;
        const singleOrder = orderCollection.find({});
        const orders = await singleOrder.toArray();
        const customerOrder = orders.filter(
          (mail) => (mail.email = email)
        );
        res.send(customerOrder);
      });

      // get Single Order
      app.get("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { id: ObjectId(id) };
        const order = await orderCollection.findOne(query);
        res.json(order);
      });

      // get all order
      app.get("/orders", async (req, res) => {
        const cursor = orderCollection.find({});
        const result = await cursor.toArray();
        res.json(result);
      });

      // delete specefic order
      app.delete("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const deleteOrder = await orderCollection.deleteOne(query);
        res.json(deleteOrder);
      });

      // update Order
      app.put("/orders/:id", async (req, res) => {
        const statusId = req.params.id;
        const updateStatus = req.body;
        const filter = { _id: ObjectId(statusId) };
        const option = { upsert: true };
        const updateOrder = {
          $set: {
            status: updateStatus.status,
          },
        };
        const acceptstatus = await orderCollection.updateOne(
          filter,
          updateOrder,
          option
        );
        res.json(acceptstatus);
      });

      // userSection
      // post user
      app.post("/users", async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      });
      // upsert user api
      app.put("/users", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const option = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          option
        );
        res.json(result);
      });
      // make admin user api
      app.put("/users/admin", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc
        );
        res.json(result);
      });

      // get All User
      app.get('/users', async (req, res) => {
        const users = usersCollection.find({});
        const result = await users.toArray();
        res.json(result);
      })
      

      // admin filtering
      app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
      });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

const port = process.env.PORT || 5050;

app.get('/', (req, res) => {
    res.send('my server is running')
})

app.listen(port, () => {
    console.log('listning to port', port)
})

