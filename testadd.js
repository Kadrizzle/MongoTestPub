const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri =
  "mongodb+srv://Kadazzle:kadizzleinthehizzle@cluster0.xgaaecl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
  var outstring = "<h1>HOMEPAGE</h1>";
  outstring += '<p><a href="./register">Go to register</a>';
  outstring += '<p><a href="./login">Go to login</a>';
  res.send(outstring);
});

app.all("/login", function (req, res) {
  var loginString = '<form action="/afterLoginSubmit" method="POST">';
  loginString += "<h1>LOGIN</h1>";
  loginString += "<label>Username: </label>";
  loginString += '<input type="text" id="username" name="username"><br>';
  loginString += "<label>Password: </label>";
  loginString += '<input type="text" id="password" name="password">';
  loginString += '<input type="submit" value="Submit">';
  loginString += "</form>";
  res.send(loginString);
});

app.all("/afterLoginSubmit", function (req, res) {
  const client = new MongoClient(uri);
  const username = req.body.username;
  const password = req.body.password;

  async function run() {
    try {
      await client.connect();
      const database = client.db("MongoTestPub");
      const data = database.collection("Data");

      const user = await data.findOne({
        username: username,
        password: password,
      });

      if (user) {
        res.cookie("user", username, { maxAge: 30000, httpOnly: true });
        res.send("Login successful!");
      } else {
        res.send("Invalid username or password.");
        var routeBackToLogin =
          '<a href="/afterLoginSubmit">Go back to login</a>';
        res.send(routeBackToLogin);
      }
    } finally {
      await client.close();
    }
  }

  run().catch(console.dir);
});

app.all("/register", function (req, res) {
  var registerString = '<form action="/afterRegisterSubmit" method="POST">';
  registerString += "<h1>REGISTER</h1>";
  registerString += "<label>Username: </label>";
  registerString += '<input type="text" id="username" name="username"><br>';
  registerString += "<label>Password: </label>";
  registerString += '<input type="text" id="password" name="password">';
  registerString += '<input type="submit" value="Submit">';
  registerString += "</form>";
  res.send(registerString);
});

app.all("/afterRegisterSubmit", function (req, res) {
  const client = new MongoClient(uri);
  databaseString = "<p>You are now registered into the database!</p>";
  databaseString += '<a href="/">Go back to homepage</a>';
  res.send(databaseString);
  const username = req.body.username;
  const password = req.body.password;

  async function run() {
    try {
      await client.connect();
      const database = client.db("MongoTestPub");
      const parts = database.collection("Data");

      const doc = {
        username: username,
        password: password,
      };

      await parts.insertOne(doc);
    } finally {
      await client.close();
    }
  }

  run().catch(console.dir);
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
