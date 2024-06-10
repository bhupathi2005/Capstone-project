const express = require('express')
const app = express()
const port = 3036
const request = require("request");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
var serviceAccount=require("./key.json");
initializeApp({
    credential: cert(serviceAccount),
  });
const db=getFirestore();
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
app.get('/weather',(req,res)=>{
    res.render('location');
})
app.get('/login',(req,res) =>{
  res.render('login');
})
app.get('/signupsubmit', (req, res) => {
  const name = req.query.name;
  const email = req.query.email;
  const password = req.query.password;
  const dob = req.query.dob;

  if (!name || !email || !password || !dob) {
      return res.status(400).send("Missing required fields");
  }

  db.collection('users').add({
      name: name,
      email: email,
      password: password,
      dob: dob
  })
  .then(() => {
      res.render('login');
  })
  .catch(error => {
  
      console.error("Error adding user to Firestore:", error);
      res.status(500).send("Error adding user to Firestore");
  });
});

app.get('/locsubmit', (req, res) => {
  console.log('no go');
  res.render('weather'); 
});
app.get('/logfail', (req, res) => {
    res.render("signup_login");
});
app.get('/loginsubmit', (req, res) => {
  const email = req.query.email;
  const password = req.query.password;

  
  if (!email || !password) {
      return res.status(400).send('Email and password are required');
  }

  
  db.collection('users')
      .where('email', '==', email)
      .where('password', '==', password)
      .get()
      .then((snapshot) => {
          if (!snapshot.empty) {
              res.render('weather');
          } else {
              res.render('loginfail');
          }
      })
      .catch((error) => {
          console.error('Error querying Firestore:', error);
          res.status(500).send('Internal Server Error');
      });
});
app.get('/loginfail', (req, res) => {
  res.render('loginfail'); 
});
app.get('/logout', (req, res) => {

  res.redirect('/login');
});
app.get('/weathersubmit', (req, res) => {
  const location = req.query.location;
  const options = {
    url: 'https://api.api-ninjas.com/v1/city?name=' + location,
    headers: {
      'X-Api-Key': 'EwesDJnpOY3/WtS9VmBCog==m7Y7tp0X9ByqaKTg'
    }
  };

  request(options, function (error, response, body) {
    if (error || JSON.parse(body).length === 0) {
      res.render('weather'); 
    } else {
      const cityInfo = JSON.parse(body)[0];
      const name = cityInfo.name || 'Unknown';
      const latitude = cityInfo.latitude || 'Unknown';
      const longitude = cityInfo.longitude || 'Unknown';
      const country = cityInfo.country || 'Unknown';
      const is_capital = cityInfo.is_capital || 'Unknown';
      const population=cityInfo.population ||'Unknown';
      console.log({ location, name, latitude, longitude, country, is_capital,population});

      res.render('location', {
        location: location,
        name: name,
        latitude: latitude,
        longitude: longitude,
        country: country,
        is_capital: is_capital,
        population:population
      });
    }
  });
});
app.listen(port,() =>{
  console.log(`Listening to port ${port}`);
});


