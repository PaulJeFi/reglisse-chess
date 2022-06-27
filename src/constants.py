# In this file, you yill find some chess constants, used to do some strange 
# chess relative computations.

# Used to place pieces in the starting position :
STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

# The famous 10 x 12 mailbox, introduced by Robert Hyatt
mailbox = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,   21, 22, 23, 24, 25, 26, 27, 28,   -1,
    -1,   31, 32, 33, 34, 35, 36, 37, 38,   -1,
    -1,   41, 42, 43, 44, 45, 46, 47, 48,   -1,
    -1,   51, 52, 53, 54, 55, 56, 57, 58,   -1,
    -1,   61, 62, 63, 64, 65, 66, 67, 68,   -1,
    -1,   71, 72, 73, 74, 75, 76, 77, 78,   -1,
    -1,   81, 82, 83, 84, 85, 86, 87, 88,   -1,
    -1,   91, 92, 93, 94, 95, 96, 97, 98,   -1,

    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1
]

mailbox64 = [
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
    51, 52, 53, 54, 55, 56, 57, 58,
    61, 62, 63, 64, 65, 66, 67, 68,
    71, 72, 73, 74, 75, 76, 77, 78,
    81, 82, 83, 84, 85, 86, 87, 88,
    91, 92, 93, 94, 95, 96, 97, 98
]

SQUARE_NAMES = [
    '',    '',   '',   '',   '',   '',   '',   '',   '',    '',
    '',    '',   '',   '',   '',   '',   '',   '',   '',    '',

    '',   'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',   '',
    '',   'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',   '',
    '',   'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',   '',
    '',   'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',   '',
    '',   'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',   '',
    '',   'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',   '',
    '',   'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',   '',
    '',   'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',   '',

    '',    '',   '',   '',   '',   '',   '',   '',   '',    '',
    '',    '',   '',   '',   '',   '',   '',   '',   '',    '',
]

EMPTY_BOARD = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,

    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1
]

# Castle mask. This idea comes from TSCP (that's where I saw it at least).
# Initial castling right = 0b_1111 (15)
# 0001 White short castle
# 0010 White long  castle
# 0100 Black short castle
# 1000 Black long  castle

# castle_right &= castle_mask[from] & castle_mask[to]
castle_mask = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,    7, 15, 15, 15,  3, 15, 15, 11,   -1,
    -1,   15, 15, 15, 15, 15, 15, 15, 15,   -1,
    -1,   15, 15, 15, 15, 15, 15, 15, 15,   -1,
    -1,   15, 15, 15, 15, 15, 15, 15, 15,   -1,
    -1,   15, 15, 15, 15, 15, 15, 15, 15,   -1,
    -1,   15, 15, 15, 15, 15, 15, 15, 15,   -1,
    -1,   15, 15, 15, 15, 15, 15, 15, 15,   -1,
    -1,   13, 15, 15, 15, 12, 15, 15, 14,   -1,

    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1
]

# Pieces, squares and colors encoding
EMPTY = NONE = 0
OFF_BOARD = -1

WHITE  = 0b_01000
BLACK  = 0b_10000

KING   = 0b_001
QUEEN  = 0b_010
ROOK   = 0b_011
BISHOP = 0b_100
KNIGHT = 0b_101
PAWN   = 0b_111

# Pieces vectors
ROOK_VECTOR     = [ -1, -10,   1,  10]
BISHOP_VECTOR   = [-11,  -9,   9,  11]
KNIGHT_VECTOR   = [-21, -19, -12, - 8,   8,  12,  19,  21]
SLIDING_VECTORS = {
    BISHOP: BISHOP_VECTOR,
    ROOK  : ROOK_VECTOR,
    QUEEN : [*BISHOP_VECTOR, * ROOK_VECTOR] 
}
# QUEEN = KING = ROOK + BISHOP
# Pawns are a little bit complex to be treated only with vectors ...

# Move encoding : 
# Moves are encoded on 21 bits like that :
#
#   ________ is en-passant
#  |
#  |
#  0 000 000 0000000 0000000
#     |   |     |       |
#     |   |     |       |
#     |   |     |       |________ to square index
#     |   |     |
#     |   |     |________ from square index
#     |   |
#     |   |_____ pomotion type (0 is NONE)         <-----\
#     |                                                   |--  without color
#     |_____ captured piece type (0 is no capture) <-----/

def encode_move(
            from_:     int,
            to_:       int,
            promotion: int=0,
            captured:  int=0,
            ep:        int=0
            ) -> int :
            '''A function that encodes moves'''

            move  = 0
            move |= to_
            move |= from_     << 7
            move |= promotion << 14
            move |= captured  << 17
            move |= ep        << 20

            return move

def str_move(move: int) -> str :
    '''Transform binary move to uci string'''
    return (
        SQUARE_NAMES[((0b_1111111 << 7) & move) >> 7] +
        SQUARE_NAMES[  0b_1111111       & move] + 
        {
            0:      '',
            QUEEN:  'q',
            ROOK:   'r',
            BISHOP: 'b',
            KNIGHT: 'n'
        }[((0b_111 << 14) & move) >> 14]
    )

def opp_color(color: int) -> int :
    '''Returns the oppisite color'''
    return (WHITE | BLACK) ^ color

def piece_color(piece: int) -> int :
    return piece & (WHITE | BLACK)

def piece_type(piece: int) -> int :
    return piece & PAWN

def check_number(integer: int, digit: int, place: int) -> bool :
    '''Used to know some particularities about number ( like same rank or same
    file)'''
    # Thanks : 
    # https://stackoverflow.com/questions/72713436/how-to-check-a-specific-digit
    # -in-integer-python/72713495#72713495

    while place > 1:
        integer = integer // 10
        place -= 1

    if integer == 0:
        return False

    if integer % 10 == digit:
        return True
    else:
        return False