from boggle import Boggle
from flask import Flask, session, request, render_template, jsonify
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
boggle_game = Boggle()
app.config["SECRET_KEY"] = "secret"

debug = DebugToolbarExtension(app)


@app.route("/")
def create_game():
    """Creates new board using boggle function"""

    board = boggle_game.make_board()

    session['board'] = board
    session['guessed_words'] = []
    highscore = session.get("highscore", 0)
    times_played = session.get("times_played", 0)
    guessed_words = session['guessed_words']

    return render_template("index.html", board=board, highscore=highscore, times_played=times_played)


@app.route("/guess-word")
def validate_word():
    """Checks if guessed word is in words.txt"""

    word = request.args["word"]
    board = session['board']
    answer = boggle_game.check_valid_word(board, word)

    if answer == "ok":
        guessed_words = session.get("guessed_words", [])
        if word in guessed_words:
            answer = "word already guessed"
        else:
            guessed_words.append(word)
            session["guessed_words"] = guessed_words

    return jsonify({'response': answer})


@app.route("/game-over", methods=['POST'])
def game_over():
    """Accepts high score from front end and increments times played"""

    session["times_played"] = session.get("times_played", 0) + 1

    score = request.json["score"]
    highscore = session.get("highscore", 0)
    session['highscore'] = max(score, highscore)

    new_record = True if score > highscore else False

    return jsonify(new_record)
