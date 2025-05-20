let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;
let timer;
let timeLeft = 30;

// Select elements
const startBtn = document.querySelector(".startQuizBtn");
const welcomeSection = document.querySelector(".welcomeSection");
const quizContainer = document.querySelector(".quizContainer");
const quizHeader = document.querySelector(".quizHeader");
const quizQuestion = document.querySelector("#questionText");
const optionsContainer = document.querySelector(".quizOptions");
const feedbackContainer = document.querySelector(".feedbackContainer");
const nextBtn = document.querySelector(".nextBtn button");
const timerElement = document.querySelector(".timeContainer");
const resultPageSection = document.querySelector(".resultPageSection");
const scoreSpan = document.querySelector("#score");
const totalScoreSpan = document.querySelector("#totalScore");
const restartBtn = document.querySelector("#restartButton");

// Start the quiz
function startQuiz() {
  welcomeSection.classList.add("hidden");
  welcomeSection.style.display = "none";
  quizContainer.style.display = "block";
  fetchQuestions();
}

// Fetch questions from JSON
function fetchQuestions() {
  fetch("./question.json")
    .then(response => response.json())
    .then(data => {
      questions = data;
      displayQuestion();
    })
    .catch(error => console.error("Error fetching questions:", error));
}

// Display a question
function displayQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  document.querySelector(".noBox").innerText = currentQuestionIndex + 1;
  quizQuestion.innerText = currentQuestion.question;

  optionsContainer.innerHTML = "";
  currentQuestion.options.forEach((option, index) => {
    const optDiv = document.createElement("div");
    optDiv.classList.add("opt", ["one", "two", "three", "four"][index], "option");
    optDiv.innerText = option;
    optDiv.addEventListener("click", () => selectOption(index, optDiv));
    optionsContainer.appendChild(optDiv);
  });

  startTimer();
}

// Handle option selection
function selectOption(index, element) {
  clearInterval(timer);
  selectedOptionIndex = index;

  const correctIndex = questions[currentQuestionIndex].correctIndex;

  // SVG icons as strings
  const tickSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24" height="24" viewBox="0 0 100 100" id="tick" style="vertical-align: middle; margin-left: 8px;">
      <path d="M50 12c-21 0-38 17-38 38s17 38 38 38 38-17 38-38-17-38-38-38zm0 72c-18.8 0-34-15.2-34-34s15.2-34 34-34 34 15.2 34 34-15.2 34-34 34zm22.9-46.9c-.8-.8-2-.8-2.8 0L44.6 62.7 33.9 52c-.8-.8-2.1-.8-2.8 0-.8.8-.8 2.1 0 2.8l12.1 12.1c.4.4.9.6 1.4.6.5 0 1-.2 1.4-.6l26.9-27c.8-.8.8-2 0-2.8z"></path>
      <path fill="#00F" d="M1644-1210V474H-140v-1684h1784m8-8H-148V482h1800v-1700z"></path>
    </svg>`;

  const crossSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24" height="24" viewBox="0 0 64 64" id="remove" style="vertical-align: middle; margin-left: 8px;">
      <path d="m18.335 42.449 1.42 1.409 12.247-12.339 12.339 12.247 1.408-1.42L33.41 30.1l12.247-12.34-1.42-1.409L31.99 28.69 19.651 16.443l-1.408 1.42 12.339 12.246z"></path>
      <path d="M31.999 64h.002c8.548 0 16.584-3.33 22.627-9.373 6.044-6.043 9.371-14.08 9.371-22.628s-3.328-16.584-9.371-22.627C48.584 3.329 40.549 0 32.001 0h-.002C23.451 0 15.415 3.329 9.372 9.373 3.328 15.417.001 23.454.001 32.001s3.328 16.584 9.371 22.627C15.416 60.671 23.451 64 31.999 64zM10.786 10.787C16.452 5.121 23.986 2 32.001 2h.002c8.012 0 15.546 3.121 21.211 8.786 5.666 5.666 8.785 13.2 8.785 21.213s-3.119 15.548-8.785 21.214S40.015 62 32.001 62h-.004c-8.012 0-15.546-3.121-21.211-8.786-5.666-5.666-8.785-13.2-8.785-21.213 0-8.014 3.119-15.548 8.785-21.214z"></path>
    </svg>`;

  // Disable all options and style selected
  document.querySelectorAll(".opt").forEach((opt, idx) => {
    opt.style.pointerEvents = "none"; // disable further clicks
    opt.classList.remove("selected");

    // Remove any previous icon span inside option
    const iconSpan = opt.querySelector("span.icon");
    if (iconSpan) iconSpan.remove();

    if (idx === index) {
      if (index === correctIndex) {
        opt.classList.add("correct"); // green border + bg
        opt.style.borderColor = "rgba(0, 128, 0, 1)";
        opt.style.backgroundColor = "rgba(0, 128, 0, 0.2)";
        opt.insertAdjacentHTML("beforeend", `<span class='icon'>${tickSVG}</span>`);
        showFeedback(true);
      } else {
        opt.classList.add("wrong"); // red border + bg
        opt.style.borderColor = "rgba(255, 0, 0, 1)";
        opt.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        opt.insertAdjacentHTML("beforeend", `<span class='icon'>${crossSVG}</span>`);
        showFeedback(false);
      }
    } else if (idx === correctIndex) {
      // Optionally, show correct answer icon on correct option even if user selected wrong
      // Uncomment below if you want this behavior:
      // opt.insertAdjacentHTML("beforeend", `<span class='icon'>${tickSVG}</span>`);
    }
  });

  nextBtn.disabled = false;
}



// Reset state before showing a new question
function resetState() {
  selectedOptionIndex = null;
  nextBtn.disabled = true;
  feedbackContainer.innerText = "";
  feedbackContainer.style.color = "";  // reset color
  feedbackContainer.style.backgroundColor = ""; // reset bg color
  clearInterval(timer);
  timeLeft = 30;
  updateTimer();
}


// Start the timer
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timer);
      feedbackContainer.innerText = "⏰ Time's up!";
      nextBtn.disabled = false;

      // ❗ Disable all options so user cannot click after time's up
      document.querySelectorAll(".opt").forEach(opt => {
        opt.style.pointerEvents = "none";
        opt.classList.add("disabled"); // Optional: add a visual cue
      });
    }
  }, 1000);
}


// Update the timer on screen
function updateTimer() {
  timerElement.innerText = timeLeft;
}

// Show feedback for selected answer
function showFeedback(isCorrect) {
  if (isCorrect) {
    feedbackContainer.innerText = "🎉 Great job! Keep it up!";
    feedbackContainer.style.color = "green";  // green text for correct
    feedbackContainer.style.backgroundColor = "rgba(0, 128, 0, 0.1)"; // light green bg (optional)
  } else {
    feedbackContainer.innerText = "💪 Don't give up! Try the next one!";
    feedbackContainer.style.color = "rgba(255, 0, 0, 0.8)";  // light red text for wrong
    feedbackContainer.style.backgroundColor = "rgba(255, 0, 0, 0.1)"; // light red bg (optional)
  }
}


// Go to the next question
function nextQuestion() {
  const correctIndex = questions[currentQuestionIndex].correctIndex;
  if (selectedOptionIndex === correctIndex) {
    score++;
    showFeedback(true);
  } else {
    showFeedback(false);
  }

  currentQuestionIndex++;

  setTimeout(() => {
    if (currentQuestionIndex < questions.length) {
      displayQuestion();
    } else {
      endQuiz();
    }
  }, 1000);
}

// Show the result screen
function endQuiz() {
  quizContainer.style.display = "none";
  resultPageSection.style.display = "flex";
  scoreSpan.innerText = score;
  totalScoreSpan.innerText = questions.length;
}

// Restart quiz (reload page)
function restartQuiz() {
  location.reload();
}

// Event listeners
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);
