const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri =
  "mongodb+srv://Kadazzle:newpassword@ckmdb.5oxvqja.mongodb.net/?retryWrites=true&w=majority";

// --- This is the standard stuff to get it to work on the browser
const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
app.listen(port);
console.log("Server started at http://localhost:" + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", function (req, res) {
  var outstring = '<p><a href="./register">Go to register</a>';
  outstring += '<p><a href="./login">Go to login</a>';
  res.send(outstring);
});

app.all("/register", function (req, res) {
  var registerString = '<form action="/insertDb" method="POST">';
  registerString += "<label>Username: </label>";
  registerString += '<input type="text" id="username" name="username"><br>';
  registerString += "<label>Password: </label>";
  registerString += '<input type="text" id="password" name="password">';
  registerString += '<input type="submit" value="Submit">';
  registerString += "</form>";
  res.send(registerString);
});

app.all("/insertDb", function (req, res) {
  const client = new MongoClient(uri);
  databaseString = "<p>You are on insertDb page</p>";
  console.log("Username: ", req.body.username);
  console.log("Password: ", req.body.password);
  res.send(databaseString);

  req.body();

  async function run() {
    try {
      const database = client.db("MongoTestPub");
      const parts = database.collection("Data");

      const doc = {
        username: req.params.username,
        password: req.params.password,
      };

      const result = await DataTransfer.insertOne(doc);
    } finally {
      await client.close();
    }
  }

  run().catch(console.dir);
});

app.get("/login", function (req, res) {
  var loginString = "<label>Username: </label>";
  loginString += '<input type="text" id="username" name="username">< /br>';
  loginString += "<label>Password: </label>";
  loginString += '<input type="text" id="password" name="password">';
  res.send(outstring);
});

app.get("/say/:name", function (req, res) {
  res.send("Hello " + req.params.name + "!");
});

// Access Example-1
// Route to access database using a parameter:
// access as ...app.github.dev/api/mongo/9876
app.get("/api/mongo/:item", function (req, res) {
  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("MongoTestPub");
      const parts = database.collection("Data");

      // Here we make a search query where the key is hardwired to 'partID'
      // and the value is picked from the input parameter that comes in the route
      const query = { partID: req.params.item };
      console.log("Looking for: " + query);

      const part = await parts.findOne(query);
      console.log(part);
      res.send("Found this: " + JSON.stringify(part)); //Use stringify to print a json
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
});

// Access Example-2
// Route to access database using two parameters:
app.get("/api/mongo2/:inpkey&:item", function (req, res) {
  // access as ...app.github.dev/api/mongo2/partID&12345
  console.log("inpkey: " + req.params.inpkey + " item: " + req.params.item);

  const client = new MongoClient(uri);

  async function run() {
    try {
      const database = client.db("ckmdb");
      const where2look = database.collection("cmps415");

      // Here we will make a query object using the parameters provided with the route
      // as they key:value pairs
      const query = {};
      query[req.params.inpkey] = req.params.item;

      console.log("Looking for: " + JSON.stringify(query));

      const part = await where2look.findOne(query);
      console.log("Found this entry: ", part);
      res.send("Found this: " + JSON.stringify(part)); //Use stringify to print a json
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
});

// Route to write to the database:
// Access like this:  https://.....app.github.dev/api/mongowrite/partID&54321
// References:
// https://www.mongodb.com/docs/drivers/node/current/usage-examples/insertOne
// https://www.mongodb.com/docs/drivers/node/current/usage-examples/insertMany

app.get("/api/mongowrite/:inpkey&:inpval", function (req, res) {
  console.log(
    "PARAMS: inpkey: " + req.params.inpkey + " inpval: " + req.params.inpval
  );

  const client = new MongoClient(uri);

  // The following is the document to insert (made up with input parameters) :
  // First I make a document object using static fields
  const doc2insert = {
    name: "Cris",
    Description: "This is a test",
  };
  // Additional fields using inputs:
  doc2insert[req.params.inpkey] = req.params.inpval;

  console.log("Adding: " + doc2insert);

  async function run() {
    try {
      const database = client.db("ckmdb");
      const where2put = database.collection("cmps415");

      const doit = await where2put.insertOne(doc2insert);
      console.log(doit);
      res.send("Got this: " + JSON.stringify(doit)); //Use stringify to print a json
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
});
