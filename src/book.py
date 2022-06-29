from board import Board
import random
import json

book = 'book.json'

def move_from_book(board: Board, Book=book) :
    '''Returns a move from the book if possible'''

    with open(Book, "r") as Table :
        table = json.load(Table)
    try :
        # Try to find a move in the book
        fen = board.fen()
        move = board.readMove(random.choice(table[fen]))
        return move
    except Exception :
        try :
            # Let's try again, with a fen without ep allowed
            fen = fen.split()
            fen[-3] = '-'
            fen = ' '.join(fen)
            move = board.readMove(random.choice(table[fen]))
            return move
        except Exception :
            return False