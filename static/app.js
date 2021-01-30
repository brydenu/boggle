const $btn = $("#btn");
let score = 0;
$('#score').append(score);
let timeRemaining = 60;
const highScore = getData().highScore;

function getData() {
    const data = {
        "highScore": $('#high-score').val(),
        "gamesPlayed": $('#games-played').val()
    }
    return data;
}

// Takes information from text field and returns the value inside
// Clears form afterwards
function getGuess() {
    const $guess = $('#user-input').val();
    $('#user-input').val("");
    return $guess;
}

// Handles submission of form
// uses getGuess to save form value into a variable
// sends variable to back end in GET request to be checked if word is valid
// returns response
$btn.on("click", async function (e) {
    e.preventDefault()

    // if form is blank nothing happens
    const $guess = getGuess();
    if (!$guess) {
        return;
    }

    const resp = await axios.get(`/guess-word?word=${$guess}`);
    const answer = resp.data.response;

    updateGame(answer, $guess);
})


// Takes a phrase given from event listener call to backend
// Depending on phrase, adds points to board and posts result
function updateGame(answer, word) {
    let textType = "invalid";

    // If response is valid, adds points to users score based on how long the word was
    if (answer === "ok") {
        score += word.length;
        textType = "valid";
        $('#used-words').append(`<p>${word}</p>`)
    }

    // Takes answer and appends to page so user can see if word was valid or not
    const $userRes = $(`<p class="${textType}">${answer}</p>`);
    $('#answer').empty().append($userRes);

    // Updates score on page to current score
    $('#score').empty().append(score);
}


// Running timer that stops game and calls gameOver() when time hits 0
// Otherwise, changes time remaining every second until 0
const timer = setInterval(function () {
    if (timeRemaining <= 0) {
        gameOver();
    } else {
        timeRemaining--;
        $('#time-remaining').empty().append(timeRemaining)
    }
}, 1000)


// Sends POST requst to backend with current score
// Returns true or false based on if score is greater than high score stored on back end
async function submitScore() {
    const res = await axios.post("/game-over", { score });
    return res.data;
}


// Function called when timer hits 0
// Alters h2 from a timer to "Time's up!"
// If high score, message will be "Time's up! New high score!"
// Stops timer using timerid and calls setRestartPage() which changes HTML
async function gameOver() {
    $btn.off();
    let msg = "Time's up!";

    // Takes return value of submission (true if high score, else false)
    // If true, message is changed to acknowledge high score
    const res = await submitScore();
    if (res) {
        msg = msg.concat(" New high score!")
    }

    // removes timer, adds message, stops timer, and calls setRestartPage() which removes text field
    $('#timer').empty().append(msg);
    clearInterval(timer);
    setRestartPage();
}

// Alters form HTML to a single button that refreshes the page which resets the game
function setRestartPage() {
    const $restartHTML = $("<button id='restart-btn' type='submit'>Play again</button>");
    $('form').empty().append($restartHTML);
}
