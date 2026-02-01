let currentQuestions = [];
let score = 0;
let answeredCount = 0;
let showAnswersMode = false;

// DOM Elements
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const quizContainer = document.getElementById("quiz-container");
const lectureTitleFn = document.getElementById("lecture-title");
const scoreDisplay = document.getElementById("score");
const showAnswersButton = document.getElementById("btn-show-answers");

function startQuiz(key) {
    // Hide home, show quiz
    homeScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    // Load data from global object (from data.js)
    const data = quizData[key];

    if (!data) {
        alert("Error: No data found for this lecture.");
        goHome();
        return;
    }

    // Set Lecture Title based on key
    const titles = {
        'oct-06': 'October 06, 2025',
        'oct-20': 'October 20, 2025',
        'nov-03': 'November 03, 2025',
        'nov-17': 'November 17, 2025',
        'dec-01': 'December 01, 2025',
        'dec-15': 'December 15, 2025',
        'jan-12': 'January 12, 2026',
        'jan-26': 'January 26, 2026'
    };
    lectureTitleFn.innerText = titles[key] || "Quiz";

    // Initialize State
    currentQuestions = data;
    score = 0;
    answeredCount = 0;
    showAnswersMode = false;
    showAnswersButton.textContent = "Show All Correct Answers";

    renderQuiz(currentQuestions);
    updateScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
    quizScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    currentQuestions = [];
}

function renderQuiz(questions) {
    quizContainer.innerHTML = "";
    questions.forEach((q, index) => {
        // Create Card
        const card = document.createElement('div');
        card.className = "mcq-card";
        card.id = `q-${index}`; // Unique ID for finding it later

        // Question Check Logic (if key ID is missing, use index)
        const qId = q.id || (index + 1);

        // Header (Question Text)
        const questionTitle = document.createElement('div');
        questionTitle.className = "question-text";
        questionTitle.textContent = `${index + 1}. ${q.question}`;
        card.appendChild(questionTitle);

        // Options Container
        const optionsList = document.createElement('div');
        optionsList.className = "options-list";

        // Generate Options
        for (let key in q.options) {
            const btn = document.createElement('label');
            btn.className = "option";
            btn.style.display = "block";
            btn.style.cursor = "pointer";
            btn.dataset.key = key; // Store key for referencing

            // Input + Text
            btn.innerHTML = `<input type="radio" name="q-${index}" value="${key}" style="margin-right:10px;"> <strong>${key}:</strong> ${q.options[key]}`;

            // Add Click Event (Use a closure or bind to pass data)
            // We use 'change' on the input or 'click' on the label. 
            // Better to use click on label and prevent double firing if needed, 
            // but effectively we just need to know which one was picked.
            // Using click on the label wrapper gives a bigger hit area.
            btn.addEventListener('click', (e) => {
                // Prevent default if already answered to stop radio toggle? 
                // Actually the logic below handles "answered" state.
                if (optionsList.classList.contains('answered')) {
                    e.preventDefault();
                    return;
                }
                // Check if the click target is the input (to avoid double event with label)
                // If clicked on label, it triggers input change. 
                // Let's just run logic. 
                handleAnswer(q, key, btn, optionsList);
            });

            optionsList.appendChild(btn);
        }

        card.appendChild(optionsList);

        // Meta Info (Slide #)
        const meta = document.createElement('div');
        meta.className = "meta-info";
        meta.innerHTML = `
            <span>Lecture: ${q.lecture}</span>
            <span class="badge">Slide: ${q.slide}</span>
        `;
        card.appendChild(meta);

        quizContainer.appendChild(card);
    });
}

function handleAnswer(question, selectedKey, btnElement, optionsList) {
    if (optionsList.classList.contains('answered')) return;

    optionsList.classList.add('answered');

    // Disable all inputs in this question
    const inputs = optionsList.querySelectorAll('input');
    inputs.forEach(input => input.disabled = true);

    // Add disabled class to all options for visual style
    Array.from(optionsList.children).forEach(child => child.classList.add('disabled'));

    const isCorrect = selectedKey === question.answer;

    if (isCorrect) {
        btnElement.classList.add('correct');
        // Add checkmark text if not present
        if (!btnElement.innerHTML.includes("✅")) {
            btnElement.innerHTML += " ✅ Correct";
        }
        score++;
    } else {
        btnElement.classList.add('wrong');
        btnElement.innerHTML += " ❌";

        // Highlight the correct answer
        const correctBtn = optionsList.querySelector(`[data-key="${question.answer}"]`);
        if (correctBtn) {
            correctBtn.classList.add('correct');
            correctBtn.innerHTML += " ✅";
        }
    }

    answeredCount++;
    updateScore();
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score} / ${currentQuestions.length}`;
}

function resetQuiz() {
    if (!confirm("Are you sure you want to reset all answers?")) return;
    score = 0;
    answeredCount = 0;
    showAnswersMode = false;
    showAnswersButton.textContent = "Show All Correct Answers";
    renderQuiz(currentQuestions);
    updateScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleShowAnswers() {
    showAnswersMode = !showAnswersMode;
    const questions = currentQuestions;

    if (showAnswersMode) {
        showAnswersButton.textContent = "Hide Answers";
        questions.forEach((q, index) => {
            const card = document.getElementById(`q-${index}`);
            if (card) {
                const correctBtn = card.querySelector(`[data-key="${q.answer}"]`);
                if (correctBtn) {
                    correctBtn.classList.add('correct');
                    if (!correctBtn.innerHTML.includes("✅")) {
                        correctBtn.innerHTML += " ✅";
                    }
                }
            }
        });
    } else {
        showAnswersButton.textContent = "Show All Correct Answers";
        questions.forEach((q, index) => {
            const card = document.getElementById(`q-${index}`);
            const optionsList = card.querySelector('.options-list');

            // Only hide if the user HAS NOT answered it yet. 
            // If the user answered it (correctly or wrongly), we usually default to showing the result state.
            // But if 'show all answers' was toggled, we want to revert to "user state".

            if (optionsList.classList.contains('answered')) {
                // If answered, do nothing? Or ensure the correct one is still marked?
                // The logic in handleAnswer adds classes permanently to the DOM elements.
                // So if we just remove classes here it interacts weirdly.

                // Re-render is safer to store user state? 
                // For this simple app, "Show Answers" usually just highlights everything.
                // "Hide Answers" should probably just remove highlights from UNANSWERED questions.
                // But my current logic adds .correct class. 

                // Let's just remove .correct IF the parent is NOT answered.
            }

            if (!optionsList.classList.contains('answered')) {
                const correctBtn = card.querySelector(`[data-key="${q.answer}"]`);
                if (correctBtn) {
                    correctBtn.classList.remove('correct');
                    correctBtn.innerHTML = correctBtn.innerHTML.replace(" ✅", "");
                }
            }
        });
    }
}
