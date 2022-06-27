import random
from constants import *
#from board import Board

# https://en.wikipedia.org/wiki/Zobrist_hashing

indices = {
    WHITE | PAWN   :  0,
    WHITE | KNIGHT :  1,
    WHITE | BISHOP :  2,
    WHITE | ROOK   :  3,
    WHITE | QUEEN  :  4,
    WHITE | KING   :  5,
    BLACK | PAWN   :  6,
    BLACK | KNIGHT :  7,
    BLACK | BISHOP :  8,
    BLACK | ROOK   :  9,
    BLACK | QUEEN  : 10,
    BLACK | KING   : 11,
    
}

class Zobrist_table(list) :
    black_to_move: int

zobrist_table = Zobrist_table([[0 for j in range(12)] for i in range(64)])

def init_zobrist() :
    # fill a table of random numbers/bitstrings
    global zobrist_table
    for i in range(64) :  # loop over the board, represented as a linear array
        for j in range(12):      # loop over the pieces
            zobrist_table[i][j] = random.getrandbits(64)
    zobrist_table.black_to_move = random.getrandbits(64)

def hash(board) -> int :
    ''' Return the hash key of the board'''
    h = 0
    if not board.turn :
        h ^= zobrist_table.black_to_move
    if board.ep[-1] != OFF_BOARD :
        h ^ board.ep[-1]
    for square in range(64) :      # loop over the board positions
        if board.board[mailbox64[square]] != EMPTY :
            j = board.board[mailbox64[square]]
            h ^= zobrist_table[square][indices[j]]
    return h ^ board.castling_rights[-1]