document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    subject: document.getElementById("subject").value,
    topic: document.getElementById("topic").value,
    score: document.getElementById("score").value,
    totalQuestions: document.getElementById("question").value,
    date: document.getElementById("date").value
  };

  let entries = [];
  try {
    entries = JSON.parse(localStorage.getItem("gateScores")) || [];
  } catch (err) {
    entries = [];
  }

  entries.push(data);
  localStorage.setItem("gateScores", JSON.stringify(entries));

  console.log("Saved entry:", data);

  document.querySelector('form').reset();
  renderEntries(); 
});

renderEntries(); 