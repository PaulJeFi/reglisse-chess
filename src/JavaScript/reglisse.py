import typing
import random
import math
import time

DEBUG  = False
NAME   = 'Reglisse-JS'
AUTHOR = 'Paul JF'
ABOUT  = NAME + ' by ' + AUTHOR + ', see ' + \
        'https://github.com/PaulJeFi/reglisse-chess'


################################################################################
##                                                                            ##
##                               CONSTANTS                                    ##
##                                                                            ##
##   You will find here some chess constants, used to do some strange chess   ##
##                         relative computations.                             ##
##                                                                            ##
################################################################################


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

CMD = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,    6,  5,  4,  3,  3,  4,  5,  6,   -1,
    -1,    5,  4,  3,  2,  2,  3,  4,  5,   -1,
    -1,    4,  3,  2,  1,  1,  2,  3,  4,   -1,
    -1,    3,  2,  1,  0,  0,  1,  2,  3,   -1,
    -1,    3,  2,  1,  0,  0,  1,  2,  3,   -1,
    -1,    4,  3,  2,  1,  1,  2,  3,  4,   -1,
    -1,    5,  4,  3,  2,  2,  3,  4,  5,   -1,
    -1,    6,  5,  4,  3,  3,  4,  5,  6,   -1,

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
PAWN   = 0b_110

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
    '''Transforms binary move to uci string'''
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
    '''Returns the opposite color'''
    return (WHITE | BLACK) ^ color

def piece_color(piece: int) -> int :
    return piece & (WHITE | BLACK)

def piece_type(piece: int) -> int :
    return piece & 0b_111

def check_number(integer: int, digit: int, place: int) -> bool :
    '''Used to know some particularities about number ( like same rank or same
    file)'''
    # Thanks : 
    # https://stackoverflow.com/questions/72713436/how-to-check-a-specific-digit
    # -in-integer-python/72713495#72713495

    while place > 1 :
        integer = integer ## 10
        place -= 1

    if integer == 0 :
        return False

    if integer % 10 == digit :
        return True
    else :
        return False
    
def manhattanDistance(sq1: int, sq2: int) -> int :

    file1 = sq1  & 7
    file2 = sq2  & 7
    rank1 = sq1 >> 3
    rank2 = sq2 >> 3
    rankDistance = abs(rank2 - rank1)
    fileDistance = abs(file2 - file1)
    return rankDistance + fileDistance


################################################################################
##                                                                            ##
##                                 BOARD                                      ##
##                                                                            ##
##              Here will be all the board representation stuff,              ##
##                  make/unmake moves, and moves generation.                  ##
##                                                                            ##
################################################################################


class Board :

    # Here are some Board's attributes :
    board = EMPTY_BOARD.copy() # Mailbox board representation
    turn: bool
    castling_rights: list # 0b_1111 (15)
    ep = []               # -1 for no ep, else square index
    move_count: list      # eg. [0, 0] in the starting position
    move_stack = []       # list of moves made
    startpos   = ''       # FEN of starting position
    
    def __init__(self, fen: str=STARTING_FEN) -> None :
        self.load_fen(fen)

    def load_fen(self, fen: str) -> None :

        # Reset some flags :
        self.ep         = []
        self.move_stack = []
        self.board      = EMPTY_BOARD.copy()
        self.startpos   = fen
        
        fen = fen.split() # So it will be easier do dissect it

        # Step 1 : initialize every flag that are not relative to piece
        # positions

        # 1.1 : turn
        self.turn = True if fen[1] == 'w' else False

        # 1.2 : castling rights
        self.castling_rights = [0]
        for char in fen[2] :
            if char == 'K' : self.castling_rights[0] |= 0b_0001
            if char == 'Q' : self.castling_rights[0] |= 0b_0010
            if char == 'k' : self.castling_rights[0] |= 0b_0100
            if char == 'q' : self.castling_rights[0] |= 0b_1000

        # 1.3 : en-passant square
        if fen[3] == '-' : self.ep.append(-1)  # No en-passant allowed
        else : self.ep.append(SQUARE_NAMES.index(fen[3]))

        # 1.4 : move count
        self.move_count = [[int(fen[4]), int(fen[5])]]

        # Step 2 : place pieces
        mail_index = 21
        for char in fen[0] :

            # Error preventer trick
            if self.board[mail_index] == OFF_BOARD : mail_index -= 1

            # Next rank :
            if char == '/' :
                mail_index += 3
                continue

            # Empty squares
            elif char.isdigit() :
                mail_index += int(char)
                continue

            # Place piece
            if   char == 'K' : self.board[mail_index] = WHITE | KING
            elif char == 'Q' : self.board[mail_index] = WHITE | QUEEN
            elif char == 'R' : self.board[mail_index] = WHITE | ROOK
            elif char == 'B' : self.board[mail_index] = WHITE | BISHOP
            elif char == 'N' : self.board[mail_index] = WHITE | KNIGHT
            elif char == 'P' : self.board[mail_index] = WHITE | PAWN
            elif char == 'k' : self.board[mail_index] = BLACK | KING
            elif char == 'q' : self.board[mail_index] = BLACK | QUEEN
            elif char == 'r' : self.board[mail_index] = BLACK | ROOK
            elif char == 'b' : self.board[mail_index] = BLACK | BISHOP
            elif char == 'n' : self.board[mail_index] = BLACK | KNIGHT
            elif char == 'p' : self.board[mail_index] = BLACK | PAWN

            # Increment index if not at end of rank
            if self.board[mail_index+1] != OFF_BOARD : mail_index += 1

    def fen(self) -> str :
        '''Export the fen position of the board'''

        fen  = ''

        # Step 1 : find pieces
        empty_count = 0
        for square in mailbox64 :

            piece = self.board[square]

            # Empty square
            if piece == EMPTY :
                empty_count += 1

            # Place piece
            if piece :

                # Empty count update
                if empty_count != 0 :
                    fen += str(empty_count)
                    empty_count = 0

                if   piece & PAWN   == PAWN   : str_piece = 'p'
                elif piece & KNIGHT == KNIGHT : str_piece = 'n'
                elif piece & BISHOP == BISHOP : str_piece = 'b'
                elif piece & ROOK   == ROOK   : str_piece = 'r'
                elif piece & QUEEN  == QUEEN  : str_piece = 'q'
                elif piece & KING   == KING   : str_piece = 'k'

                if piece & WHITE : fen += str_piece.upper()
                else : fen += str_piece

            # Last square of rank
            if square % 10 == 8 : # all rank's end squares index end by digit 8
                # Empty count update
                if empty_count != 0 :
                    fen += str(empty_count)
                    empty_count = 0
                if square != 98 : fen += '/' # if the square is not the last one


        # Step 2 : add flags

        # Step 2.1 : turn
        if self.turn : fen += ' w '
        else : fen += ' b '

        # Step 2.2 : castling rights
        if (self.castling_rights[-1] & 0b_0001) : fen += 'K'
        if (self.castling_rights[-1] & 0b_0010) : fen += 'Q'
        if (self.castling_rights[-1] & 0b_0100) : fen += 'k'
        if (self.castling_rights[-1] & 0b_1000) : fen += 'q'
        elif not self.castling_rights[-1] : fen += '-'

        # Step 2.3 : en-passant square
        if SQUARE_NAMES[self.ep[-1]] == '' : fen += ' - '
        else : fen += f' {SQUARE_NAMES[self.ep[-1]]} '

        # Step 2.4 : move count
        fen += f'{self.move_count[-1][0]} {self.move_count[-1][1]}'


        return fen

    def push(self, move: int) -> None :

        from_ = (move & 0b_0_000_000_1111111_0000000) >> 7
        to_   =  move & 0b_0_000_000_0000000_1111111

        piece = self.board[from_]

        # Pawn moves
        if (piece & PAWN) == PAWN : # Pawns are special : en-passant, promotion

            # 1 : promotion
            promotion = (move & 0b_0_000_111_0000000_0000000) >> 14
            if promotion :
                self.board[to_] = piece_color(self.board[from_]) | promotion
                self.board[from_] = EMPTY
                self.ep.append(-1)
            
            # 2 : double pawn push
            elif abs(from_ - to_) == 20 :
                self.board[to_] = self.board[from_]
                self.board[from_] = EMPTY
                self.ep.append(int((to_ + from_)/2)) # En-passant square
            
            # 3 : en-passant
            elif move >> 20 :
                self.ep.append(-1)

                if from_ < to_ : # Black takes White
                    self.board[to_ - 10] = EMPTY
                    self.board[to_] = self.board[from_]
                    self.board[from_] = EMPTY

                else : # White takes Black
                    self.board[to_ + 10] = EMPTY
                    self.board[to_] = self.board[from_]
                    self.board[from_] = EMPTY

            # 4 : Others pawn moves
            else :
                self.board[to_] = self.board[from_]
                self.board[from_] = EMPTY
                self.ep.append(-1)

        # King moves
        elif (piece ^ WHITE) == KING or (piece ^ BLACK) == KING :

            self.ep.append(-1)
            self.board[to_] = self.board[from_]
            self.board[from_] = EMPTY

            if abs(from_ - to_) == 2 : # castle

                if to_ == 97 : # White's short castle
                    self.board[96] = WHITE | ROOK
                    self.board[98] = EMPTY

                elif to_ == 93 : # White's long castle
                    self.board[94] = WHITE | ROOK
                    self.board[91] = EMPTY

                elif to_ == 27 : # BLack's short castle
                    self.board[26] = BLACK | ROOK
                    self.board[28] = EMPTY

                elif to_ == 23 : # BLack's long castle
                    self.board[24] = BLACK | ROOK
                    self.board[21] = EMPTY

        # Other pieces moves
        else :
            
            self.board[to_] = self.board[from_]
            self.board[from_] = EMPTY
            self.ep.append(OFF_BOARD)

        # Flags update (note that ep flag is updated while making moves)
        
        # Castling rights update :
        self.castling_rights.append(
            self.castling_rights[-1] & castle_mask[from_] & castle_mask[to_]
        )

        self.turn = not self.turn
        self.move_stack.append(move)

        # Move count update
        rule_50 = self.move_count[-1][0] + 1
        move_count = self.move_count[-1][1]
        if (piece & PAWN) == PAWN : rule_50 = 0 # pawn move
        elif move & 0b_0_111_000_0000000_0000000 : rule_50 = 0 # capture move
        if self.turn : move_count += 1 # change if Black just played, since we
                                       # have already updated turn
        self.move_count.append([rule_50, move_count])

    def pop(self, move: int) -> None :

        from_         = (move & 0b_0_000_000_1111111_0000000) >> 7
        to_           =  move & 0b_0_000_000_0000000_1111111
        captured_type = (move & 0b_0_111_000_0000000_0000000) >> 17

        # Place the moved piece on its starting square
        self.board[from_] = self.board[to_]

        # If the move is a promotion, place a pawn on from_ square
        if move & 0b_0_000_111_0000000_0000000 :
            self.board[from_] = piece_color(self.board[from_]) | PAWN

        if move & 0b_1_000_000_0000000_0000000 : # If ep move
            self.board[to_] = EMPTY # To square remains EMPTY
            if piece_color(self.board[from_]) == WHITE : # White ep
                self.board[to_ + 10] = BLACK | PAWN
            else :
                self.board[to_ - 10] = WHITE | PAWN

        # If the move is a capture move, replace the captured piece
        elif captured_type :
            color = WHITE if self.turn else BLACK
            self.board[to_] = color | captured_type
        # Else (ie no capture move), TO square is EMPTY
        else :  self.board[to_] = EMPTY

        # Castle move :
        if abs(from_ - to_) == 2 and piece_type(self.board[from_]) == KING :
            if to_ == 97 : # White short castle
                self.board[98] = WHITE | ROOK
                self.board[96] = EMPTY
            elif to_ == 93 : # White long castle
                self.board[91] = WHITE | ROOK
                self.board[94] = EMPTY
            elif to_ == 27 : # Black short castle
                self.board[28] = BLACK | ROOK
                self.board[26] = EMPTY
            elif to_ == 23 : # Black long castle
                self.board[21] = BLACK | ROOK
                self.board[24] = EMPTY

        # Update flags :
        self.turn = not self.turn
        self.castling_rights.pop()
        self.ep.pop()
        self.move_count.pop()
        self.move_stack.pop()

    def push_NONE(self) -> None :
        # flags update
        self.turn = not self.turn
        self.move_stack.append(NONE)

    def pop_NONE(self) -> None :
        # flags update
        self.turn = not self.turn
        self.move_stack.pop()

    def attack(self, square: int, color: int) -> bool :
        '''Determines if color attacks square. Used for example by legal moves
        verifications'''

        # Attacked by Knight
        for offset in KNIGHT_VECTOR :
            attacker = square + offset
            if self.board[attacker] == color | KNIGHT :
                return True
        
        # Attacked by King
        for offset in [*BISHOP_VECTOR, *ROOK_VECTOR] :
            attacker = square + offset
            if self.board[attacker] == color | KING :
                return True

        # Attacked by Bishop or Queen
        for offset in BISHOP_VECTOR :
            for i in range(1, 8) :
                attacker = square + offset * i
                if self.board[attacker] == color | BISHOP :
                    return True
                if self.board[attacker] == color | QUEEN :
                    return True
                if self.board[attacker] == EMPTY :
                    continue
                break
                
        # Attacked by Rook or Queen
        for offset in ROOK_VECTOR :
            for i in range(1, 8) :
                attacker = square + offset * i
                if self.board[attacker] == color | ROOK :
                    return True
                if self.board[attacker] == color | QUEEN :
                    return True
                if self.board[attacker] == EMPTY :
                    continue
                break
                
        # Attacked by pawn
        if color == WHITE : # White pawn
            if self.board[square + 9]  == WHITE | PAWN :
                return True
            if self.board[square + 11] == WHITE | PAWN :
                return True
        else : # Black pawn
            if self.board[square - 9]  == BLACK | PAWN :
                return True
            if self.board[square - 11] == BLACK | PAWN :
                return True

        return False

    def genKnight(self, square: int, color: int) -> list :
        '''Generation of pseudo-legal moves for a given knight'''
        
        moves = []
        # color = WHITE is self.turn else BLACK
        for offset in KNIGHT_VECTOR :
            to_ = square + offset
            if self.board[to_] != OFF_BOARD and not (self.board[to_] & color) :
                moves.append(encode_move(
                    square,
                    to_,
                    0,
                    (self.board[to_] | WHITE | BLACK) ^ (WHITE | BLACK),
                    0
                ))
        return moves

    def genSliding(self, square: int, color: int, VECTOR: list) -> list :
        '''Generation of pseudo-legal moves for a given sliding piece.
        Sliding pieces = Bishop + Rook + Queen (King too, but more complex)'''
        
        moves = []
        for offset in VECTOR :
            for i in range(1, 8) :
                to_ = square + i * offset
                if self.board[to_] == OFF_BOARD or (self.board[to_] & color) :
                    break
                else :
                    moves.append(encode_move(
                        square,
                        to_,
                        0,
                        (self.board[to_] | WHITE | BLACK) ^ (WHITE | BLACK),
                    ))
                    if self.board[to_] != EMPTY :
                        break
        return moves

    def genPawn(self, square: int, color: int) -> list :

        moves = []

        # White's pawns
        if color == WHITE :

            # Promotion :
            if check_number(square, 3, 2) : # Pawn on 7-rank

                if self.board[square - 10] == EMPTY : # Normal promotion
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        moves.append(encode_move(
                            square,
                            square - 10,
                            piece,
                        ))

                # Capture promotion
                if piece_color(self.board[square - 11]) == BLACK :
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        moves.append(encode_move(
                            square,
                            square - 11,
                            piece,
                            piece_type(self.board[square - 11])
                        ))
                if piece_color(self.board[square - 9]) == BLACK :
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        moves.append(encode_move(
                            square,
                            square - 9,
                            piece,
                            piece_type(self.board[square - 9])
                        ))

            else :

                # If is on its starting square, try double pawn push
                if check_number(square, 8, 2) : # pawn on starting square
                    if self.board[square - 10] == EMPTY and \
                       self.board[square - 20] == EMPTY :
                        moves.append(encode_move(
                            square,
                            square - 20,
                        ))
                
                # Check for single push :
                if self.board[square - 10] == EMPTY :
                    moves.append(encode_move(
                            square,
                            square - 10,
                        ))
                
                # Capture move
                if piece_color(self.board[square - 11]) == BLACK :
                    moves.append(encode_move(
                        square,
                        square - 11,
                        0,
                        piece_type(self.board[square - 11])
                    ))
                if piece_color(self.board[square - 9]) == BLACK :
                    moves.append(encode_move(
                        square,
                        square - 9,
                        0,
                        piece_type(self.board[square - 9])
                    ))

                # En-passant
                if square - 11 == self.ep[-1] :
                    moves.append(encode_move(
                        square,
                        square - 11,
                        0,
                        0, # 0 because in ep, the captured pawn is not on the
                           #target square
                        1
                    ))
                if square - 9 == self.ep[-1] :
                    moves.append(encode_move(
                        square,
                        square - 9,
                        0,
                        0, # 0 because in ep, the captured pawn is not on the
                           # target square
                        1
                    ))

        # Black's pawns
        else :

            # Promotion :
            if check_number(square, 8, 2) : # Pawn on 2-rank

                if self.board[square + 10] == EMPTY : # Normal promotion
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        moves.append(encode_move(
                            square,
                            square + 10,
                            piece,
                        ))

                # Capture promotion
                if piece_color(self.board[square + 11]) == WHITE :
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        moves.append(encode_move(
                            square,
                            square + 11,
                            piece,
                            piece_type(self.board[square + 11])
                        ))
                if piece_color(self.board[square + 9]) == WHITE :
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        moves.append(encode_move(
                            square,
                            square + 9,
                            piece,
                            piece_type(self.board[square + 9])
                        ))

            else :

                # If is on its starting square, try double pawn push
                if check_number(square, 3, 2) : # pawn on starting square
                    if self.board[square + 10] == EMPTY and \
                       self.board[square + 20] == EMPTY :
                        moves.append(encode_move(
                            square,
                            square + 20,
                        ))
                
                # Check for single push :
                if self.board[square + 10] == EMPTY :
                    moves.append(encode_move(
                            square,
                            square + 10,
                        ))
                
                # Capture move
                if piece_color(self.board[square + 11]) == WHITE :
                    moves.append(encode_move(
                        square,
                        square + 11,
                        0,
                        piece_type(self.board[square + 11])
                    ))
                if piece_color(self.board[square + 9]) == WHITE :
                    moves.append(encode_move(
                        square,
                        square + 9,
                        0,
                        piece_type(self.board[square + 9])
                    ))

                # En-passant
                if square + 11 == self.ep[-1] :
                    moves.append(encode_move(
                        square,
                        square + 11,
                        0,
                        0, # 0 because in ep, the captured pawn is not on the
                           # target square
                        1
                    ))
                if square + 9 == self.ep[-1] :
                    moves.append(encode_move(
                        square,
                        square + 9,
                        0,
                        0, # 0 because in ep, the captured pawn is not on the
                           # target square
                        1
                    ))

        return moves

    def genKing(self, square: int, color: int) -> list :
        '''Generates LEGAL King moves'''

        moves = []

        opp = opp_color(color)

        # Nomal king moves
        for offset in [*BISHOP_VECTOR, *ROOK_VECTOR] :
            to_ = square + offset
            if self.board[to_] != OFF_BOARD and not (self.board[to_] & color) \
                and not self.attack(to_, opp) :
                moves.append(encode_move(
                    square,
                    to_,
                    0,
                    (self.board[to_] | WHITE | BLACK) ^ (WHITE | BLACK),
                    0
                ))

        # Castling moves
        if color == WHITE and not self.attack(square, opp) : # White king
            if (self.castling_rights[-1] & 0b_0001) and self.board[96] == EMPTY\
                and self.board[97] == EMPTY and not self.attack(96, opp) \
                    and not self.attack(97, opp): # short caslte allowed
                moves.append(encode_move(
                    square,
                    97
                ))
            if (self.castling_rights[-1] & 0b_0010) and self.board[92] == EMPTY\
                and self.board[93] == EMPTY and self.board[94] == EMPTY  and \
                    self.board[92] == EMPTY and not self.attack(94, opp) and \
                        not self.attack(93, opp) : # long caslte allowed
                moves.append(encode_move(
                    square,
                    93
                ))

        elif color == BLACK and not self.attack(square, opp) : # Black king
            if (self.castling_rights[-1] & 0b_0100) and self.board[26] == EMPTY\
                and self.board[27] == EMPTY and not self.attack(26, opp) \
                    and not self.attack(27, opp): # short caslte allowed
                moves.append(encode_move(
                    square,
                    27
                ))
            if (self.castling_rights[-1] & 0b_1000) and self.board[22] == EMPTY\
                and self.board[23] == EMPTY and self.board[24] == EMPTY  and \
                    self.board[22] == EMPTY and not self.attack(24, opp) and \
                        not self.attack(23, opp) : # long caslte allowed
                moves.append(encode_move(
                    square,
                    23
                ))

        return moves

    def genPseudoLegalMoves(self) -> list :

        moves = []
        color = WHITE if self.turn else BLACK

        # Let's iterate over each square
        for square in mailbox64 :
            # A piece can move only if its color is the color side to move
            if self.board[square] & color :

                piece = self.board[square] ^ color # Extracting the piece type

                # Knight
                if piece == KNIGHT :
                    moves = [*moves, *self.genKnight(square, color)]

                # Sliding pieces (BISHOP, ROOK, QUEEN)
                elif piece == BISHOP or piece == ROOK or piece == QUEEN :
                    moves = [
                        *moves, *self.genSliding(square, color,
                        SLIDING_VECTORS[piece])
                    ]

                # Pawn
                elif piece == PAWN :
                    moves = [*moves, *self.genPawn(square, color)]

                # King
                elif piece == KING :
                    moves = [*moves, *self.genKing(square, color)]

        return moves

    def is_check(self, color: int) -> bool :
        '''Is the color's king in check ?'''
        # Note : color side has to have a king !

        if self.attack(self.board.index(KING | color), opp_color(color)) :
            return True

        return False

    def genPawnCapture(self, square: int, color: int) -> typing.Generator :
        '''A copy of genPawn, just single and double push are removed.
        Note : queening (or just promotiong a pawn) is here considered as a
        capture move, because material balance changes.'''

        # White's pawns
        if color == WHITE :

            # Promotion :
            if check_number(square, 3, 2) : # Pawn on 7-rank

                if self.board[square - 10] == EMPTY : # Normal promotion
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        yield encode_move(
                            square,
                            square - 10,
                            piece,
                        )

                # Capture promotion
                if piece_color(self.board[square - 11]) == BLACK :
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        yield encode_move(
                            square,
                            square - 11,
                            piece,
                            piece_type(self.board[square - 11])
                        )
                if piece_color(self.board[square - 9]) == BLACK :
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        yield encode_move(
                            square,
                            square - 9,
                            piece,
                            piece_type(self.board[square - 9])
                        )

            else :

                # Capture move
                if piece_color(self.board[square - 11]) == BLACK :
                    yield encode_move(
                        square,
                        square - 11,
                        0,
                        piece_type(self.board[square - 11])
                    )
                if piece_color(self.board[square - 9]) == BLACK :
                    yield encode_move(
                        square,
                        square - 9,
                        0,
                        piece_type(self.board[square - 9])
                    )

                # En-passant
                if square - 11 == self.ep[-1] :
                    yield encode_move(
                        square,
                        square - 11,
                        0,
                        0, # 0 because in ep, the captured pawn is not on the
                           #target square
                        1
                    )
                if square - 9 == self.ep[-1] :
                    yield encode_move(
                        square,
                        square - 9,
                        0,
                        0, # 0 because in ep, the captured pawn is not on the
                           # target square
                        1
                    )

        # Black's pawns
        else :

            # Promotion :
            if check_number(square, 8, 2) : # Pawn on 2-rank

                if self.board[square + 10] == EMPTY : # Normal promotion
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        yield encode_move(
                            square,
                            square + 10,
                            piece,
                        )

                # Capture promotion
                if piece_color(self.board[square + 11]) == WHITE :
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        yield encode_move(
                            square,
                            square + 11,
                            piece,
                            piece_type(self.board[square + 11])
                        )
                if piece_color(self.board[square + 9]) == WHITE :
                    for piece in (QUEEN, KNIGHT, BISHOP, ROOK) :
                        yield encode_move(
                            square,
                            square + 9,
                            piece,
                            piece_type(self.board[square + 9])
                        )

            else :

                # Capture move
                if piece_color(self.board[square + 11]) == WHITE :
                    yield encode_move(
                        square,
                        square + 11,
                        0,
                        piece_type(self.board[square + 11])
                    )
                if piece_color(self.board[square + 9]) == WHITE :
                    yield encode_move(
                        square,
                        square + 9,
                        0,
                        piece_type(self.board[square + 9])
                    )

                # En-passant
                if square + 11 == self.ep[-1] :
                    yield encode_move(
                        square,
                        square + 11,
                        0,
                        0, # 0 because in ep, the captured pawn is not on the
                           # target square
                        1
                    )
                if square + 9 == self.ep[-1] :
                    yield encode_move(
                        square,
                        square + 9,
                        0,
                        0, # 0 because in ep, the captured pawn is not on the
                           # target square
                        1
                    )

    def genPseudoLegalCaptures(self) -> typing.Generator :
        '''Generating pseudo-legal captures only.'''

        color = WHITE if self.turn else BLACK

        # Let's iterate over each square
        for square in mailbox64 :
            # A piece can move only is its color is the color side to move
            if self.board[square] & color :

                piece = self.board[square] ^ color # Extracting the piece type

                # Knight
                if piece == KNIGHT :
                    for offset in KNIGHT_VECTOR :
                        to_ = square + offset
                        if self.board[to_] != OFF_BOARD and \
                            not (self.board[to_] & color) and \
                                self.board[to_] != EMPTY :
                            yield encode_move(
                                square,
                                to_,
                                0,
                                (self.board[to_] | WHITE|BLACK) ^ (WHITE|BLACK),
                                0
                            )
        

                # Sliding pieces
                elif piece == BISHOP or piece == ROOK or piece == QUEEN :
                    for offset in SLIDING_VECTORS[piece] :
                        for i in range(1, 8) :
                            to_ = square + i * offset
                            if self.board[to_] == OFF_BOARD or \
                                (self.board[to_] & color) :
                                break
                            elif self.board[to_] != EMPTY :
                                yield encode_move(
                                    square,
                                    to_,
                                    0,
                                    (self.board[to_]|WHITE|BLACK)^(WHITE|BLACK),
                                )
                                if self.board[to_] != EMPTY :
                                    break

                # Pawn
                elif piece == PAWN :
                    # Promotions moves are added with captures here.
                    yield from self.genPawnCapture(square, color)

                # King
                elif piece == KING :

                    opp = opp_color(color)

                    # Nomal king moves : remenber, king can't capture with a
                    # castling move.
                    for offset in [*BISHOP_VECTOR, *ROOK_VECTOR] :
                        to_ = square + offset
                        if self.board[to_] != OFF_BOARD and \
                            not (self.board[to_] & color) \
                            and not self.attack(to_, opp) \
                                and self.board[to_] != EMPTY :
                            yield encode_move(
                                square,
                                to_,
                                0,
                                (self.board[to_] | WHITE|BLACK) ^ (WHITE|BLACK),
                                0
                            )

    def genLegal(self) -> list :
        '''Generating legal moves only. DO NOT USE because too slow'''

        moves = []
        for move in self.genPseudoLegalMoves() :
            turn = WHITE if self.turn else BLACK
            self.push(move)
            if not self.is_check(turn) :
                moves.append(move)
            self.pop(move)
        return moves

    def readMove(self, move: str) -> int :
        '''Convert UCI move to encoded move (int)'''

        try :
            if len(move) not in (4, 5) : return 0 # Illegal move
            if len(move) == 5 :
                promotion = {'q': QUEEN, 'n': KNIGHT, 'r': ROOK, 
                    'b': BISHOP}[move[-1]]
            else :
                promotion = 0

            from_ = SQUARE_NAMES.index(move[0:2])
            to_   = SQUARE_NAMES.index(move[2:4])

            if self.board[to_] != EMPTY :
                capture = piece_type(self.board[to_])
            else :
                capture = EMPTY

            # en-passant ?
            if piece_type(self.board[from_]) == PAWN \
                and self.board[to_] == EMPTY and (abs(from_ - to_) in (9, 11)) :
                    ep = 1
            else :
                ep = 0

            Move  = encode_move(from_, to_, promotion,
                                piece_type(self.board[to_]), ep)

            assert Move in self.genLegal(), f'Illegal move : {move}'

            return Move

        except Exception :
            print(f'Illegal move : {move}')

        return 0
    
    def __hash__(self) -> int :
        return hash__(self)
    

################################################################################
##                                                                            ##
##                                 PERFT                                      ##
##                                                                            ##
##      The perft function is a way to debug make/unmake moves and moves      ##
##                 generation and to test their performances.                 ##
##                                                                            ##
################################################################################


def perft(board: Board, depth: int) -> int :
    '''Simple perft function'''

    nodes = 0
    if depth == 0 :
        return 1
    for move in board.genPseudoLegalMoves() :
        turn = WHITE if board.turn else BLACK
        board.push(move)
        if not board.is_check(turn) :
            nodes += perft(board, depth-1)
        board.pop(move)
    return nodes

def PERFT(board: Board, depth: int, indent='') -> int :
    '''Detailled perft function'''

    nodes = 0
    if depth == 0 :
        return 1
    for move in board.genPseudoLegalMoves() :
        turn = WHITE if board.turn else BLACK
        board.push(move)
        if not board.is_check(turn) :
            #node = PERFT(board, depth-1, indent+'\t')
            node = perft(board, depth-1)
            nodes += node
            print(indent + str_move(move), ':', node)
        board.pop(move)

    print(indent + "total nodes :", nodes)
    return nodes


################################################################################
##                                                                            ##
##                                EVALUATION                                  ##
##                                                                            ##
##           The evaluation function gives a score to a given board.          ##
##                      Here, peSTO evaluation is used.                       ##
##                                                                            ##
################################################################################


SKILL = 20
contempt = 0

def skill() -> int :
    return random.random() * (SKILL - 20) * 200 - (SKILL - 20) * 100

FLIP = lambda sq : sq ^ 56

mateValue = 100_000_000_000-1

# Piece values :
#            P   N    B    R     Q    K
mg_value = [82, 337, 365, 477, 1025,  0, EMPTY][::-1]
eg_value = [94, 281, 297, 512,  936,  0, EMPTY][::-1]

# PSQT :
mg_pawn_table = [
      0,   0,   0,   0,   0,   0,  0,   0,
     98, 134,  61,  95,  68, 126, 34, -11,
     -6,   7,  26,  31,  65,  56, 25, -20,
    -14,  13,   6,  21,  23,  12, 17, -23,
    -27,  -2,  -5,  12,  17,   6, 10, -25,
    -26,  -4,  -4, -10,   3,   3, 33, -12,
    -35,  -1, -20, -23, -15,  24, 38, -22,
      0,   0,   0,   0,   0,   0,  0,   0,
]

eg_pawn_table = [
      0,   0,   0,   0,   0,   0,   0,   0,
    178, 173, 158, 134, 147, 132, 165, 187,
     94, 100,  85,  67,  56,  53,  82,  84,
     32,  24,  13,   5,  -2,   4,  17,  17,
     13,   9,  -3,  -7,  -7,  -8,   3,  -1,
      4,   7,  -6,   1,   0,  -5,  -1,  -8,
     13,   8,   8,  10,  13,   0,   2,  -7,
      0,   0,   0,   0,   0,   0,   0,   0,
]

mg_knight_table = [
    -167, -89, -34, -49,  61, -97, -15, -107,
     -73, -41,  72,  36,  23,  62,   7,  -17,
     -47,  60,  37,  65,  84, 129,  73,   44,
      -9,  17,  19,  53,  37,  69,  18,   22,
     -13,   4,  16,  13,  28,  19,  21,   -8,
     -23,  -9,  12,  10,  19,  17,  25,  -16,
     -29, -53, -12,  -3,  -1,  18, -14,  -19,
    -105, -21, -58, -33, -17, -28, -19,  -23,
]

eg_knight_table = [
    -58, -38, -13, -28, -31, -27, -63, -99,
    -25,  -8, -25,  -2,  -9, -25, -24, -52,
    -24, -20,  10,   9,  -1,  -9, -19, -41,
    -17,   3,  22,  22,  22,  11,   8, -18,
    -18,  -6,  16,  25,  16,  17,   4, -18,
    -23,  -3,  -1,  15,  10,  -3, -20, -22,
    -42, -20, -10,  -5,  -2, -20, -23, -44,
    -29, -51, -23, -15, -22, -18, -50, -64,
]

mg_bishop_table = [
    -29,   4, -82, -37, -25, -42,   7,  -8,
    -26,  16, -18, -13,  30,  59,  18, -47,
    -16,  37,  43,  40,  35,  50,  37,  -2,
     -4,   5,  19,  50,  37,  37,   7,  -2,
     -6,  13,  13,  26,  34,  12,  10,   4,
      0,  15,  15,  15,  14,  27,  18,  10,
      4,  15,  16,   0,   7,  21,  33,   1,
    -33,  -3, -14, -21, -13, -12, -39, -21,
]

eg_bishop_table = [
    -14, -21, -11,  -8, -7,  -9, -17, -24,
     -8,  -4,   7, -12, -3, -13,  -4, -14,
      2,  -8,   0,  -1, -2,   6,   0,   4,
     -3,   9,  12,   9, 14,  10,   3,   2,
     -6,   3,  13,  19,  7,  10,  -3,  -9,
    -12,  -3,   8,  10, 13,   3,  -7, -15,
    -14, -18,  -7,  -1,  4,  -9, -15, -27,
    -23,  -9, -23,  -5, -9, -16,  -5, -17,
]

mg_rook_table = [
     32,  42,  32,  51, 63,  9,  31,  43,
     27,  32,  58,  62, 80, 67,  26,  44,
     -5,  19,  26,  36, 17, 45,  61,  16,
    -24, -11,   7,  26, 24, 35,  -8, -20,
    -36, -26, -12,  -1,  9, -7,   6, -23,
    -45, -25, -16, -17,  3,  0,  -5, -33,
    -44, -16, -20,  -9, -1, 11,  -6, -71,
    -19, -13,   1,  17, 16,  7, -37, -26,
]

eg_rook_table = [
    13, 10, 18, 15, 12,  12,   8,   5,
    11, 13, 13, 11, -3,   3,   8,   3,
     7,  7,  7,  5,  4,  -3,  -5,  -3,
     4,  3, 13,  1,  2,   1,  -1,   2,
     3,  5,  8,  4, -5,  -6,  -8, -11,
    -4,  0, -5, -1, -7, -12,  -8, -16,
    -6, -6,  0,  2, -9,  -9, -11,  -3,
    -9,  2,  3, -1, -5, -13,   4, -20,
]

mg_queen_table = [
    -28,   0,  29,  12,  59,  44,  43,  45,
    -24, -39,  -5,   1, -16,  57,  28,  54,
    -13, -17,   7,   8,  29,  56,  47,  57,
    -27, -27, -16, -16,  -1,  17,  -2,   1,
     -9, -26,  -9, -10,  -2,  -4,   3,  -3,
    -14,   2, -11,  -2,  -5,   2,  14,   5,
    -35,  -8,  11,   2,   8,  15,  -3,   1,
     -1, -18,  -9,  10, -15, -25, -31, -50,
]

eg_queen_table = [
     -9,  22,  22,  27,  27,  19,  10,  20,
    -17,  20,  32,  41,  58,  25,  30,   0,
    -20,   6,   9,  49,  47,  35,  19,   9,
      3,  22,  24,  45,  57,  40,  57,  36,
    -18,  28,  19,  47,  31,  34,  39,  23,
    -16, -27,  15,   6,   9,  17,  10,   5,
    -22, -23, -30, -16, -16, -23, -36, -32,
    -33, -28, -22, -43,  -5, -32, -20, -41,
]

mg_king_table = [
    -65,  23,  16, -15, -56, -34,   2,  13,
     29,  -1, -20,  -7,  -8,  -4, -38, -29,
     -9,  24,   2, -16, -20,   6,  22, -22,
    -17, -20, -12, -27, -30, -25, -14, -36,
    -49,  -1, -27, -39, -46, -44, -33, -51,
    -14, -14, -22, -46, -44, -30, -15, -27,
      1,   7,  -8, -64, -43, -16,   9,   8,
    -15,  36,  12, -54,   8, -28,  24,  14,
]

eg_king_table = [
    -74, -35, -18, -18, -11,  15,   4, -17,
    -12,  17,  14,  17,  17,  38,  23,  11,
     10,  17,  23,  15,  20,  45,  44,  13,
     -8,  22,  24,  27,  26,  33,  26,   3,
    -18,  -4,  21,  24,  27,  23,   9, -11,
    -19,  -3,  11,  21,  23,  16,   7,  -9,
    -27, -11,   4,  13,  14,   4,  -5, -17,
    -53, -34, -21, -11, -28, -14, -24, -43
]

mg_tot_table = [
    mg_pawn_table,
    mg_knight_table,
    mg_bishop_table,
    mg_rook_table,
    mg_queen_table,
    mg_king_table, []
][::-1]

eg_tot_table = [
    eg_pawn_table,
    eg_knight_table,
    eg_bishop_table,
    eg_rook_table,
    eg_queen_table,
    eg_king_table, []
][::-1]

# Pieces indexing
PIECES = {
    WHITE | PAWN   : 0,
    WHITE | KNIGHT : 1,
    WHITE | BISHOP : 2,
    WHITE | ROOK   : 3,
    WHITE | QUEEN  : 4,
    WHITE | KING   : 5,
    BLACK | PAWN   : 6,
    BLACK | KNIGHT : 7,
    BLACK | BISHOP : 8,
    BLACK | ROOK   : 9,
    BLACK | QUEEN  : 10,
    BLACK | KING   : 11
}

# For tapered eval
gamephaseInc = [0,0,1,1,1,1,2,2,4,4,0,0]
mg_table = [[0 for _ in range(64)] for __ in range(12)]
eg_table = [[0 for _ in range(64)] for __ in range(12)]

for piece in [PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING] :
        for sq in range(64) :
            mg_table[PIECES[piece | WHITE]][sq] = mg_value[piece] +\
                mg_tot_table[piece][sq]
            mg_table[PIECES[piece | BLACK]][sq] = mg_value[piece] +\
                mg_tot_table[piece][FLIP(sq)]
            eg_table[PIECES[piece | WHITE]][sq] = eg_value[piece] +\
                eg_tot_table[piece][sq]
            eg_table[PIECES[piece | BLACK]][sq] = eg_value[piece] +\
                eg_tot_table[piece][FLIP(sq)]
            
def mop_up(board: Board) -> int :
    '''mop-up evaluation'''

    material = [0, 0] # material score for [WHITE, BLACK]
    side2move = 1 if board.turn else -1
    score = 0

    for sq in mailbox64 :
        piece = board.board[sq]
        if piece != EMPTY :
            material[piece_color(piece) >> 4] += eg_value[piece_type(piece)]

    winner = 1 # white
    if material[1] == material[0] :
        return 0
    elif material[1] > material[0] :
        winner = -1
    
    score += winner * (
        4.7 * CMD[board.board.index(KING | (WHITE if winner == 1 else BLACK))]
        + 1.6 * (14 - manhattanDistance(
            mailbox64.index(mailbox[board.board.index(KING | WHITE)],
            mailbox64.index(mailbox[board.board.index(KING | BLACK)]
    )))))

    return score * side2move


def evaluate(board: Board) -> int :

    late_eg_score = 0
    # if no pawns are on the board, we are in late endgame
    if (not (board.board.count(WHITE | PAWN) or \
             board.board.count(BLACK | PAWN))) :
        
        late_eg_score = mop_up(board)

    mg = [0, 0]
    eg = [0, 0]
    gamePhase = 0

    for sq in range(64) :
        piece = board.board[mailbox64[sq]]
        if piece != EMPTY :
            mg[piece_color(piece) >> 4] += mg_table[PIECES[piece]][sq]
            eg[piece_color(piece) >> 4] += eg_table[PIECES[piece]][sq]
            gamePhase += gamephaseInc[PIECES[piece]]

    side2move = 0 if board.turn else 1

    mgScore = mg[side2move] - mg[side2move ^ 1]
    egScore = eg[side2move] - eg[side2move ^ 1]
    mgPhase = min(gamePhase, 24)
    egPhase = 24 - mgPhase

    return late_eg_score + int((mgScore * mgPhase + egScore * egPhase) / 24) \
           + int(0 if SKILL == 20 else skill())


def value_draw(depth, nodes, board, player, ply) :
    ''' Add small random value to draw positions to add dynamism to the engine.
    Comtempt factor is seen as how happy would the engine been of drawing :
    quite happy against a stronger opponent (positive contempt), and quite
    unhappy against a weaker opponent (negative contempt). Note that is should
    be done for ealier draws, as avoiding late draws cans lead to a loss.'''
    return 0 if depth < 4 else ((2 * nodes % 2) - 1 \
                    - (contempt if board.turn == player else -contempt)/(ply+1))


################################################################################
##                                                                            ##
##                             ZOBRIST HASHING                                ##
##                                                                            ##
## Zobrist hashing is a way to represent the board by a quite unique integer. ##
##                  This is usefull for Transposition Table.                  ##
##                                                                            ##
################################################################################


# https://en.wikipedia.org/wiki/Zobrist_hashing

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

def hash__(board) -> int :
    ''' Compute the hash key of the board'''
    h = 0
    if not board.turn :
        h ^= zobrist_table.black_to_move
    if board.ep[-1] != OFF_BOARD :
        h ^ board.ep[-1]
    for square in range(64) :      # loop over the board positions
        if board.board[mailbox64[square]] != EMPTY :
            j = board.board[mailbox64[square]]
            h ^= zobrist_table[square][PIECES[j]]
    return h ^ board.castling_rights[-1]


################################################################################
##                                                                            ##
##                           TRANSPOSITION TABLE                              ##
##                                                                            ##
##            The transposition table (TT) is usefull when reaching           ##
##                       already visited positions.                           ##
##                                                                            ##
################################################################################

'''
    The idea with TT is that information is faster to store than to compute.
    The TT is a list with fixed lenght (ttSIZE).
    Each element is en Entry, containing differents informations, like :
        - a zobrist key to identify a position
        - a null flag, to disallow or not null-move pruning
        - a depth, to decide if it is judicious to use the information stored
        - a value, corresponding to the evaluation of the position
        - a flag, giving information about the accuracy of the value
        - a move, storing the best move possible in this position

    Given a zobrist key, the Entry index in the TT is calculated by :
        index = key % ttSIZE
'''

init_zobrist()


R = 2               # R is the depth reduction when we do a null-move search.
                    # See later.
ttSIZE = 2**19 # The size of the transposition table (TT).

# Some hash flag used in TT :
hashEXACT    = 0
hashALPHA    = 1
hashBETA     = 2
valUNKNOW    = 1.5       # impossible to have eval = 1.5 in practise
valInTT      = 2.5       # impossible to have eval = 2.5 in practise

class Entry :
    '''A class that represents a TT entry'''
    key   = 0
    depth = 0
    value = 0
    flag  = 0
    move  = 0

tt = [Entry() for _ in range(ttSIZE)] # TT

def setHashSize(Mb: int) -> None :
    '''Set the hash size (thanks to WukongJS)'''
    # adjust MB if going beyond the aloowed bounds
    Mb = max(4, min(Mb, 256))
    
    global ttSIZE
    # make sure ttSIZE is a power of 2
    ttSIZE = 2 ** int(math.log((Mb * 0x100000 / 20), 2))
    reset_tables()

def score_to_tt(score: int, ply: int) -> int :
    return  score + ply       if score >=   mateValue - 2 * MAX_PLY \
            else (score - ply if score <= -(mateValue - 2 * MAX_PLY) else score)

def score_from_tt(score: int, ply: int, rule50: int) -> int :

    if (score >= mateValue - 2 * MAX_PLY) : # win
        if (score >= mateValue - MAX_PLY and mateValue - score > 99 - rule50) :
            return mateValue - MAX_PLY - 1 # return only true mate score

        return score - ply

    if score <= -(mateValue - 2 * MAX_PLY) : # loss
        if (score <= -(mateValue-MAX_PLY) and mateValue + score > 99 - rule50) :
            return -(mateValue - MAX_PLY) + 1 # return only true mate score

        return score + ply

    return score

def ProbeHash(is_pv: bool, depth: int, alpha: int, beta: int, hash_: int,
              ply: int, rule50: int) -> int :
    '''Probe the TT to extract information if it exists about a given
    position.'''

    entry = tt[hash_ & (ttSIZE-1)]
    if entry.key == hash_ :

        value = score_from_tt(entry.value, ply, rule50)

        if entry.depth >= depth and \
                    (depth <= 0 or not (is_pv and UCI_AnalyseMode)) :

            # Table is exact or produces a cutoff
            if   entry.flag == hashEXACT or \
                (entry.flag == hashALPHA) and (value <= alpha) or \
                (entry.flag == hashBETA)  and (value >= beta) :
                return value

            # An entry with one depth lower can be accepted in some conditions.
            if (not is_pv) and entry.depth >= depth - 1 and \
                    entry.flag == hashALPHA and value + 128 <= alpha :
                return alpha

        return valInTT
    
    return valUNKNOW

def RecordHash(depth: int, ply: int, val: int, flag: int, hash_: int,
               best_move=0, stop_search: bool=False) -> None:
    '''Store information about the position in the TT.'''

    if stop_search :
        return

    # Replacement scheme
    tt_entry = tt[hash_ & (ttSIZE-1)]
    if flag != hashEXACT and hash_ == tt_entry.key \
        and depth < tt_entry.depth - 2 :
        return None
        
    entry       = Entry()
    entry.key   = hash_
    entry.value = score_to_tt(val, ply)
    entry.flag  = flag
    entry.depth = depth
    entry.move  = best_move
    tt[hash_ & (ttSIZE-1)] = entry


################################################################################
##                                                                            ##
##                             MOVE ORDERING                                  ##
##                                                                            ##
##                Searching best moves first is faster than                   ##
##                      searching them in random order.                       ##
##                                                                            ##
################################################################################


MAX_PLY = 1024

# History heuristic store :
history = [
    [[NONE for ___ in range(98+1)] for __ in range(98+1)] for _ in range(2)
]
# Killer move store :
killers = [[NONE, NONE] for _ in range(MAX_PLY)]

def reset_tables() :
    global tt
    global history
    global killers

    tt = [Entry() for _ in range(ttSIZE)]
    history = [
        [[NONE for ___ in range(98+1)] for __ in range(98+1)] for _ in range(2)
    ]
    killers = [[NONE, NONE] for _ in range(MAX_PLY)]

reset_tables()

def history_new_iteration() -> None :
    # Divide by 8 history heuristic, to not have a too big behaviour of history
    # on new search depth
    history = [[[history[i][j][k]/8
          for k in range(98+1)] for j in range(98+1)] for i in range(2)]


# MVV_LVA[attacker][victim]
MVV_LVA = [
    # Victim      K    Q    R    B    N    P    / Attacker
                [600, 500, 400, 300, 200, 100], #    K
                [601, 501, 401, 301, 201, 101], #    Q
                [602, 502, 402, 302, 202, 102], #    R
                [603, 503, 403, 303, 203, 103], #    B
                [604, 504, 404, 304, 204, 104], #    N
                [605, 505, 405, 305, 205, 105], #    P
]

def score_move(move: int, board: Board, ply: int, best_move: int=0) -> int :
    ''' A method for move ordering. An heuristic to assign score to moves to
    search probable best moves at first, so that search is faster.'''

    score = 0

    if move == best_move :
        return mateValue

    if move & 0b0_1_111_000_0000000_0000000 : # If the move is a capture move
        # Apply MVV-LVA scoring. The idea is to say that taking a valuable piece
        # with a smaller piece (like PxQ) is probably better than taking a
        # smaller piece with a valuable one (like QxP).
        if move & 0b0_1_000_000_0000000_0000000 : # ep
            return 105 # PxP
        return MVV_LVA[((move >> 17) & 0b111)-1][piece_type(
            board.board[(move >> 7) & 0b1111111])-1]

    # Else if the move is not a capture move, let's simply use Killer Moves and
    # History Heuristic
    if killers[ply][0] == move :
        score += 9000
    elif killers[ply][1] == move :
        score += 8000
    score +=  history[board.turn >> 0][(move & 0b0_1111111_0000000) >> 7]\
            [move & 0b0_1111111]

    return score

def ordering(board: Board, ply: int, moves: list, hash_=False,
             tt_move: int=NONE) -> typing.List[int] :
    ''' A move ordering method. See score_move() '''

    best_move = 0
    if hash_ and (tt_move == NONE) :
        entry = tt[hash_ & (ttSIZE-1)]
        if entry.key == hash_ :
            best_move = entry.move
    elif tt_move != NONE :
        best_move = tt_move

    Moves = [[move, score_move(move, board, ply, best_move)] for move in moves]

    Moves.sort(key=lambda a: a[1], reverse=True)

    return [m[0] for m in Moves]

################################################################################
UCI_AnalyseMode = False
