const express = require('express');
const path = require('path');
const fs = require('file');
const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
  res.render('index')
});

app.post('/create',(req,res)=>{
   res.render('details');
   res.redirect('/');
})
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
});