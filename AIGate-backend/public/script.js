function topicSelector(){
    var subjectDropdown = document.getElementById('subject');
    var topicDropdown = document.getElementById('topic');
 
    topicDropdown.innerHTML="";
    var selectedSubject = subjectDropdown.value;
    var topics = {
        "Engineering Mathematics":[ "Discrete Math", "Linear Algebra", "Calculus", "Probability & Statistics"],
        "Digital Logic":["Boolean Algebra", "Combinational Circuits", "Sequential Circuits", "Number Representation", "Minimization"],
        "Computer Organization and Architecture":["Machine Instructions", "ALU/Datapath", "Pipelining", "Memory Hierarchy", "I/O Interface"],
        "Programming and Data Structures":["Recursion", "Arrays", "Stacks & Queues", "Linked Lists", "Trees", "Graphs", "Hashing"],
        "Algorithms":["Analysis", "Sorting", "Searching", "Greedy", "Dynamic Programming", "Divide & Conquer", "Graph Algorithms"],
        "Theory of Computation":["Regular Languages", "Finite Automata", "Context-Free Grammars", "Pushdown Automata", "Turing Machines", "Undecidability"],
        "Compiler Design":["Lexical Analysis", "Parsing (LL/LR)", "Syntax-Directed Translation", "Intermediate Code", "Code Optimization"],
        "Operating System":["Processes & Threads", "CPU Scheduling", "Synchronization", "Deadlock", "Memory Management", "Virtual Memory", "File Systems" ],
        "Databases":["ER Model", "Relational Model", "SQL", "Normalization", "Transactions", "Concurrency Control", "Indexing"],
        "Computer Networks":["OSI/TCP-IP Layers", "Routing", "Congestion Control", "IP Addressing", "Application Layer Protocols"]
    }
    var topicOptions = topics[selectedSubject];
    for(var i=0;i<topicOptions.length;i++){
        var option = document.createElement('option');
        option.text=topicOptions[i];
        option.value=topicOptions[i];
        topicDropdown.add(option);
    }
}
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('success');
 
  if (status === 'true') {
    showToast('successMessage');
  } else if (status === 'false') {
    showToast('errorMessage');
  }
 
  function showToast(elementId) {
    const toast = document.getElementById(elementId);
    toast.classList.remove('hidden');
    window.history.replaceState({}, document.title, '/');
 
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 4000);
  }
});
 document.addEventListener('submit', ()=>{
    document.getElementById('submit').innerText = 'Saving...';
 });