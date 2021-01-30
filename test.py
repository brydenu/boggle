from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    # TODO -- write tests for every view function / feature!
    def test_create_game(self):
        with app.test_client() as client:
            res = client.get('/')

            self.assertEqual(res.status_code, 200)
            self.assertEqual(session['guessed_words'], [])

    def test_validate_word(self):
        with app.test_client() as client:
            with client.session_transaction() as change_session:
                change_session['board'] = [
                    ["T", "H", "I", "S", "S"],
                    ["B", "O", "A", "R", "D"],
                    ["T", "E", "N", "T", "T"],
                    ["L", "E", "I", "G", "E"],
                    ["J", "S", "T", "T", "P"]]

            res = client.get('/guess-word?word=testing')
            self.assertEqual(res.json['response'], 'ok')
            res = client.get('/guess-word?word=thisisnotaword')
            self.assertEqual(res.json['response'], 'not-word')
            res = client.get('/guess-word?word=exact')
            self.assertEqual(res.json['response'], 'not-on-board')

    def test_game_over(self):
        with app.test_client() as client:

            res = client.post("/game-over", data={'score': 1000})
            self.assertEqual(res.status_code, 200)
