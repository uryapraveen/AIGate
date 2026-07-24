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
4. Allocate MORE questions to the weakest topic, fewer to the moderately weak ones. Question count must be proportional to weakness.
5. Each question must be GATE-style (MCQ only — no MSQ, no numerical-answer type) at genuine exam difficulty.
6. Provide exactly 4 options per question.

MANDATORY self-check before including any question:
- Fully solve the question yourself first.
- Confirm exactly one of the 4 options is unambiguously correct.
- If you cannot verify a clean, unambiguous answer, DISCARD that question and generate a different one on the same topic instead. Never include a question you are unsure about.
- If fewer clean questions are possible for a topic than planned, reduce that topic's count silently rather than including a flawed question.
- If any question involves LaTeX or mathematical notation with backslashes (e.g., \sum, \{, \}, \mid), you MUST escape every single backslash as \\\\ in the JSON output, so it forms valid JSON. Double-check each backslash in mathematical expressions before finalizing your response.
OUTPUT FORMAT — CRITICAL, FOLLOW EXACTLY:
Return ONLY a raw JSON array. No markdown code fences, no backticks, no "json" label, no headers, no explanation, no text before or after the array — your entire response must be parseable directly by JSON.parse().

Each element in the array must be an object with exactly this shape:
{
  "topic": "string — the subject/topic name",
  "question_text": "string — the full question",
  "options": ["string", "string", "string", "string"],
  "correct_answer": "string — must exactly match one of the four strings in options"
}

Example of the exact format required (structure only, not real content):
[{"topic":"Digital Logic","question_text":"...","options":["...","...","...","..."],"correct_answer":"..."}]

Return the array now, with no other text.`
    });

    const rawQuizText = quizResponse.text;
    const cleanedQuizText = rawQuizText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '');

    let quizQuestions;
    try {
      quizQuestions = JSON.parse(cleanedQuizText);
    } catch (err) {
      console.error('Failed to parse Gemini quiz JSON:', err);
      console.error('Raw text was:', rawQuizText);
      return res.status(500).json({
        success: false,
        message: 'Quiz generation failed — could not parse AI response. Please try again.'
      });
    }
    const quizId = Date.now();

    const rowsToInsert = quizQuestions.map((q, index) => ({
      quiz_id: quizId,
      roll_no: requiredRoll,
      question_number: index + 1,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      user_answer: null,
      topic: q.topic,
    }));

    const { error: insertError } = await supabase.from('quiz_questions').insert(rowsToInsert);
    if (insertError) throw insertError;

    res.render('results', { diagnosis: diagnosisHtml, quizId, requiredRoll });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Data is not fetched or analyzed',
      error: err.message
    });
  }
})

app.get('/quiz/:quizId/:requiredRoll', async (req, res) => {
  try {
    const requiredquizeId = req.params.quizId;
    const requiredRoll = req.params.requiredRoll;
    const { data: quizData, error } = await supabase.from('quiz_questions').select('*').eq("quiz_id", requiredquizeId);
    if (error) throw error;
    res.render('quiz', { data: quizData, quizId: requiredquizeId, requiredRoll });
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: 'quiz is not formed',
      error: err.message
    })
  }

})

app.post('/results/:requiredRoll', async (req, res) => {
  try {
    const requiredquiz_Id = req.body.quiz_id;
    const requiredRoll = req.params.requiredRoll;
    const { data: quizData, error } = await supabase.from('quiz_questions').select('*').eq("quiz_id", requiredquiz_Id);
    if (error) throw error;

    let count = 0;

    for (const q of quizData) {
      const user_answer = req.body[q.question_number];
      const { error: updateError } = await supabase
        .from('quiz_questions')
        .update({ user_answer: user_answer })
        .eq('quiz_id', q.quiz_id)
        .eq('question_number', q.question_number);

      if (updateError) throw updateError;
    }

    for (const q of quizData) {
      const user_answer = req.body[q.question_number];
      const correct_answer = q.correct_answer;

      if (user_answer === correct_answer) {
        count++;
      }

      const { error: updateError } = await supabase
        .from('quiz_questions')
        .update({ user_answer: user_answer })
        .eq('quiz_id', q.quiz_id)
        .eq('question_number', q.question_number);

      if (updateError) {
        console.error('Failed to update row:', updateError);
      }
    }
    const arr = [];
    for (const q of quizData) {
      const topic = q.topic;
      if (!arr.includes(topic)) {
        arr.push(topic);
      }
    }
    const values = [];
    for (const a of arr) {
      let count1 = 0;
      let count2 = 0;
      for (const q of quizData) {
        if (a === q.topic) {
          count2++;
          if (q.user_answer === q.correct_answer) {
            count1++;
          }
        }
        else {
          continue;
        }
      }
      const value = { score: count1, total: count2 };
      values.push(value);
    }


    const total = quizData.length;

    return res.render('score', { count, total, arr, values, requiredRoll });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'quiz is not formed',
      error: err.message
    });
  }
});

app.post('/add', async (req, res) => {
  try {
    const requiredRoll = req.body.requiredRoll;
    const arr = JSON.parse(req.body.arr);
    const values = JSON.parse(req.body.values);
    const arr1 = [];
    const seperateData = arr.map(item => {
      const parts = item.split('(');
      const mainsubject = parts[0].trim();
      const subtopic = parts[1].replace(')', '').trim();
      const value = { subject: mainsubject, topic: subtopic }
      arr1.push(value);
    })

    for (let index = 0; index < arr.length; index++) {
      const subjectName = arr1[index].subject;
      const topicsName = arr1[index].topic;
      const scoreObj = values[index];

      const rowData = {
        roll_no: requiredRoll,
        subject: subjectName,
        topic: topicsName,
        score: scoreObj.score,
        total_questions: scoreObj.total,
        date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase.from('details').insert([rowData]);
      if (error) throw error;
    }

    return res.redirect('/?success=true');
  } catch (err) {
    console.error("Error adding scores to database:", err);
    return res.redirect('/?success=false');
  }
});
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
});