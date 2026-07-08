const express = require('express');
const path = require('path');
const supabase = require('./public/supabaseClient');
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index')
});

app.post('/create', async (req, res) => {
  const data = {
    roll_no: req.body.rollno,
    subject: req.body.subject,
    topic: req.body.topic,
    score: req.body.score,
    total_questions: req.body.question,
    date: req.body.date
  };
  try {
    const { data: insertedData, error } = await supabase.from('details').insert([data]).select();
    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Data pushed successfully!',
      data: insertedData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Data is not pushed'
    });
  }
});

app.get('/analytics',  (req, res) => {
   res.render('details')
})

app.get('/analysis',async (req,res)=>{
  const requiredRoll = req.query.info;
  try{
      const {data:fetchedData , error} = await supabase.from('details').select('*').eq("roll_no",requiredRoll);
      if(error){
        throw error;
      }
      return res.status(201).json({
        success:true,
        message:'Data Successfully Fetched',
        data:fetchedData
      });
  }catch(err){
     return res.status(500).json({
      success:false,
      message:'data is not fetched'
     });
  }
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
});