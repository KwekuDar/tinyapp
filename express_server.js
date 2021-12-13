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

///////////// Helper Functions ///////////////
const { generateRandomString, emailExists, findPassword, findUserID, urlsForUser, getUserByEmail } = require("./helper");
///////////// Helper Functions End //////////

const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID:"aJ48lW"},
  "9sm5xK": { longURL:"http://www.google.com", userID: "aJ48lW"}
};

const users = { 
};


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
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
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
    users[userId] = {"id": userId , "email": req.body.email, "password": hashedPassword};
    req.session.user_id = userId;
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("404 not found! This URL doesn't exist");
  } else if (req.session.user_id) {
    res.status(400).send("400 error ! Please Login or Register");
  } else if (urlDatabase[req.params.shortURL].user_id !== req.session.user_id) {
    res.status(403).send("403 error ! You do not have access to this URL");
  } else {
    res.status(400).send("400 error ! Please Login");
  }
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
  if (urlDatabase[req.params.shortURL]["userID"] === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("You do not have permission to delete this url");
  }         
});

app.post("/urls/:id", (req, res) => {  
  if (urlDatabase[req.params.id].userID === req.session.user_id) {
    let longURL = req.body.longURL;
    urlDatabase[req.params.id].longURL = longURL;
    res.redirect('/urls');
  } else {
    res.status(403).send("You do not have the permission to edit this url");
  }         
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const registeredPassword = findPassword(email, users);
  const registeredEmail = getUserByEmail(email, users);
  if (email === "" || password === "") {
    res.status(403).send('<h1>Error!</h1> <p>You need to enter values for email and password.</p>');
  } if (emailExists(email, users) === false) {
    res.status(403).send('<h1>Error!</h1> <p>This email is not associated with an account. Register for an account if you do not already have one.</p>');
  } if (email === registeredEmail.email) {
      if (bcrypt.compareSync(password, registeredPassword)) {
        req.session.user_id = findUserID(email, users);
        res.redirect("/urls");
      } else {
          res.status(403).send('<h1>Error!</h1> <p>Password is incorrect.</p>');
        }
      } 
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");  
});




// for nodemon
// .\node_modules\.bin\nodemon -L express_server.js

