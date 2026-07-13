const express = require('express');
const path = require('path');
const supabase = require('./public/supabaseClient');
const gemini = require('./public/googleClient');
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
    return res.redirect('/?success=true');
  } catch (err) {
    console.error(err);
    return res.redirect('/?success=false');
  }
});
 
app.get('/analytics', (req, res) => {
  res.render('details')
})
 
app.get('/analysis', async (req, res) => {
  const requiredRoll = req.query.info;
 
  try {
    const { data: fetchedData, error } = await supabase.from('details').select('*').eq("roll_no", requiredRoll);
    if (error) throw error;
 
    const diagnosisResponse = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the data of a student: ${JSON.stringify(fetchedData)}. This student is preparing for the GATE exam. Based on the marks scored out of total marks for each subject, tell them which subjects they should focus on.`
    });
    const diagnosisText = diagnosisResponse.text;
 
    const quizResponse = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on this analysis of a student preparing for GATE: "${diagnosisText}", create a short quiz targeting their weak areas.`
    });
    const quizText = quizResponse.text;
 
    return res.status(200).json({
      success: true,
      diagnosis: diagnosisText,
      quiz: quizText
    });
 
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Data is not fetched or analyzed',
      error: err.message
    });
  }
})
 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
});
 