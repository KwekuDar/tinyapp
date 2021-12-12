//express
const express = require("express");
const app = express();
//Port
const PORT = 8080;

//Ejs
app.set("view engine", "ejs");

//Password Hash
// const bcrypt = require('bcrypt');

//Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
};

///////////// Helper Functions ///////////////
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

function emailExists(email) {
  for (let id in users) {
    if (users[id]["email"] === email) {
      return true;
    } 
  }
  return false
};
////////////// Helper Functions End //////////////

///////////// Global Variables //////////////


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  console.log(emailExists(email));
  if (email === "" || password === "") {
    res.status(400).send('<h1>Error!</h1> <p>You need to enter values for email and password.</p>');
  } if (emailExists(email) === true) {
    res.status(400).send('<h1>Error!</h1> <p>This email is already associated with an account. Try another one.</p>');
  } if ((emailExists(email)) === false) {
    users[userId] = {"id": userId , "email": req.body.email, "password": req.body.password,};
    res.cookie('user_id', userId);
    console.log(users);
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {  
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");         
});

app.post("/urls/:id", (req, res) => {  
  urlDatabase[req.params.id]['longURL'] = req.body.newURL;
  res.redirect("/urls");         
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userKeys = Object.keys(users);
  console.log(emailExists(email));
  if (email === "" || password === "") {
    res.status(403).send('<h1>Error!</h1> <p>You need to enter values for email and password.</p>');
  } if (emailExists(email) === false) {
    res.status(403).send('<h1>Error!</h1> <p>This email is not associated with an account. Register for an account if you do not already have one.</p>');
  } if ((emailExists(email)) === true) {
      for (key of userKeys) {
        if (users[key]["password"] === password) {
          res.cookie('user_id', users[key]["id"]);
          res.redirect("/urls");
        } if (users[key]["password"] !== password) {
          res.status(403).send('<h1>Error!</h1> <p>Password is incorrect.</p>');
        }
      }
    } 
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");  
});




// for nodemon
// .\node_modules\.bin\nodemon -L express_server.js

