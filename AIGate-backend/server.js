const express = require('express');
const path = require('path');
const supabase = require('./public/supabaseClient');
const gemini = require('./public/googleClient');
const app = express()
const { marked } = require('marked');

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
    const diagnosisHtml = marked.parse(diagnosisText);

    const quizResponse = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a GATE exam mock-test creator. Base this task only on the weak areas identified in the analysis below. Do not include strong or average-performing subjects.

Analysis: "${diagnosisText}"

Task:
1. Extract only the subjects/topics marked as weak areas in the analysis above.
2. Rank them from weakest to least-weak based on the scores mentioned.
3. Create a mock exam using ONLY these weak-area topics — no other subjects.
4. Allocate MORE questions to the weakest topic, fewer to the moderately weak ones. Question count must be proportional to weakness (weakest topic gets the most questions).
5. Each question must be GATE-style (numerical, MCQ, or MSQ) at genuine exam difficulty.

MANDATORY self-check before including any question:
- Fully solve the question yourself first.
- Confirm exactly one option is unambiguously correct (for MCQ), or the correct set is unambiguous (for MSQ), or the numerical answer is a single defensible value.
- If you cannot verify a clean, unambiguous answer, DISCARD that question and silently generate a different one on the same topic instead. Never include a question you are unsure about.
- Never leave a question in the output where the options don't match your own worked solution.

Output rules — MUST follow exactly:
- Output ONLY the final quiz and answer key. Do not include reasoning, scratch work, self-corrections, alternate attempts, phrases like "let me re-check" or "I'll assume," or any indication of uncertainty.
- The answer key must state the final answer and a short explanation only — never show failed attempts or discarded reasoning paths.
- If, after your internal verification, fewer clean questions are possible for a topic than originally planned, reduce that topic's count silently rather than including a flawed question.

Output format — follow exactly:
## Mock Exam: Weak Area Focus
### [Topic Name] (Weakest — X questions)
Q1. ...
Q2. ...
### [Topic Name] (Second weakest — Y questions)
Q1. ...
...
## Answer Key
Q1. Answer — brief explanation
...`
    });
    const quizHtml = marked.parse(quizResponse.text);

    res.render('results', { diagnosis: diagnosisHtml, quiz: quizHtml });

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
