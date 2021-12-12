//express
const express = require("express");
const app = express();
//Port
const PORT = 8080;

//Ejs
app.set("view engine", "ejs");

//Password Hash
const bcrypt = require('bcryptjs');

//Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID:"aJ48lW"},
  "9sm5xK": { longURL:"http://www.google.com", userID: "aJ48lW"}
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
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.status(400).send('<h1>Error!</h1> <p>You need to enter values for email and password.</p>');
  } if (emailExists(email) === true) {
    res.status(400).send('<h1>Error!</h1> <p>This email is already associated with an account. Try another one.</p>');
  } if ((emailExists(email)) === false) {
    users[userId] = {"id": userId , "email": req.body.email, "password": hashedPassword,};
    req.session.user_id = userId;
    console.log(users);
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, user: users[req.session.user_id]};
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.session.user_id] };
  if (users[req.session.user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, user: users[req.session.user_id], urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { 'longURL': longURL, userID: userID };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  const email = req.body.email;
  const password = req.body.password;
  let userKeys = Object.keys(users);
  if (email === "" || password === "") {
    res.status(403).send('<h1>Error!</h1> <p>You need to enter values for email and password.</p>');
  } if (emailExists(email) === false) {
    res.status(403).send('<h1>Error!</h1> <p>This email is not associated with an account. Register for an account if you do not already have one.</p>');
  } if ((emailExists(email)) === true) {
      for (key of userKeys) {
        if (bcrypt.compareSync(password, users[key]["password"])) {
          req.session.user_id = users[key]["id"];
          res.redirect("/urls");
        } else {
          res.status(403).send('<h1>Error!</h1> <p>Password is incorrect.</p>');
        }
      }
    } 
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");  
});




// for nodemon
// .\node_modules\.bin\nodemon -L express_server.js

