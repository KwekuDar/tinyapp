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



///////////// Helper Functions ///////////////
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}
////////////// Helper Functions End //////////////


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
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
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls");         
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");  
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");  
});



// for nodemon
// .\node_modules\.bin\nodemon -L express_server.js

