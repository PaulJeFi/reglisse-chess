from board import *

piece_value = {PAWN: 100,
               KNIGHT: 300,
               BISHOP: 320,
               ROOK: 500,
               QUEEN: 900,}

mateValue = 100_000_000_000-1

BISHOP_PAIR_BONNUS = 0.5

K_mg = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,  -30,-40,-40,-50,-50,-40,-40,-30,   -1,
    -1,  -30,-40,-40,-50,-50,-40,-40,-30,   -1,
    -1,  -30,-40,-40,-50,-50,-40,-40,-30,   -1,
    -1,  -30,-40,-40,-50,-50,-40,-40,-30,   -1,
    -1,  -20,-30,-30,-40,-40,-30,-30,-20,   -1,
    -1,  -10,-20,-20,-20,-20,-20,-20,-10,   -1,
    -1,   20, 20,  0,  0,  0,  0, 20, 20,   -1,
    -1,   20, 30, 10,  0,  0, 10, 30, 20,   -1,

    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1
]

K_eg = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,  -50,-40,-30,-20,-20,-30,-40,-50,   -1,
    -1,  -30,-20,-10,  0,  0,-10,-20,-30,   -1,
    -1,  -30,-10, 20, 30, 30, 20,-10,-30,   -1,
    -1,  -30,-10, 30, 40, 40, 30,-10,-30,   -1,
    -1,  -30,-10, 30, 40, 40, 30,-10,-30,   -1,
    -1,  -30,-10, 20, 30, 30, 20,-10,-30,   -1,
    -1,  -30,-30,  0,  0,  0,  0,-30,-30,   -1,
    -1,  -50,-30,-30,-30,-30,-30,-30,-50,   -1,

    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1
]

Q = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,  -20,-10,-10, -5, -5,-10,-10,-20,   -1,
    -1,  -10,  0,  0,  0,  0,  0,  0,-10,   -1,
    -1,  -10,  0,  5,  5,  5,  5,  0,-10,   -1,
    -1,   -5,  0,  5,  5,  5,  5,  0, -5,   -1,
    -1,    0,  0,  5,  5,  5,  5,  0, -5,   -1,
    -1,  -10,  5,  5,  5,  5,  5,  0,-10,   -1,
    -1,  -10,  0,  5,  0,  0,  0,  0,-10,   -1,
    -1,  -20,-10,-10, -5, -5,-10,-10,-20,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1
]

R = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,    5, 10, 10, 10, 10, 10, 10,  5,   -1,
    -1,   -5,  0,  0,  0,  0,  0,  0, -5,   -1,
    -1,   -5,  0,  0,  0,  0,  0,  0, -5,   -1,
    -1,   -5,  0,  0,  0,  0,  0,  0, -5,   -1,
    -1,   -5,  0,  0,  0,  0,  0,  0, -5,   -1,
    -1,   -5,  0,  0,  0,  0,  0,  0, -5,   -1,
    -1,    0,  0,  0,  5,  5,  0,  0,  0,   -1,
      
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1]

N = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    
    -1,  -50,-40,-30,-30,-30,-30,-40,-50,   -1,
    -1,  -40,-20,  0,  0,  0,  0,-20,-40,   -1,
    -1,  -30,  0, 10, 15, 15, 10,  0,-30,   -1,
    -1,  -30,  5, 15, 20, 20, 15,  5,-30,   -1,
    -1,  -30,  0, 15, 20, 20, 15,  0,-30,   -1,
    -1,  -30,  5, 10, 15, 15, 10,  5,-30,   -1,
    -1,  -40,-20,  0,  5,  5,  0,-20,-40,   -1,
    -1,  -50,-40,-30,-30,-30,-30,-40,-50,   -1,

    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1]

B = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,   20,-10,-10,-10,-10,-10,-10,-20,   -1,
    -1,  -10,  0,  0,  0,  0,  0,  0,-10,   -1,
    -1,  -10,  0,  5, 10, 10,  5,  0,-10,   -1,
    -1,  -10,  5,  5, 10, 10,  5,  5,-10,   -1,
    -1,  -10,  0, 10, 10, 10, 10,  0,-10,   -1,
    -1,  -10, 10, 10, 10, 10, 10, 10,-10,   -1,
    -1,  -10,  5,  0,  0,  0,  0,  5,-10,   -1,
    -1,  -20,-10,-10,-10,-10,-10,-10,-20,   -1,
    
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1
]

P = [
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,

    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,
    -1,   50, 50, 50, 50, 50, 50, 50, 50,   -1,
    -1,   10, 10, 20, 30, 30, 20, 10, 10,   -1,
    -1,    5,  5, 10, 25, 25, 10,  5,  5,   -1,
    -1,    0,  0,  0, 20, 20,  0,  0,  0,   -1,
    -1,    5, -5,-10,  0,  0,-10, -5,  5,   -1,
    -1,    5, 10, 10,-20,-20, 10, 10,  5,   -1,
    -1,    0,  0,  0,  0,  0,  0,  0,  0,   -1,

    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1,
    -1,   -1, -1, -1, -1, -1, -1, -1, -1,   -1]

psqt_table = {KING: [K_mg, K_eg],
              QUEEN: Q,
              ROOK: R,
              KNIGHT: N,
              BISHOP: B,
              PAWN: P}

# For endgame checking (phase of the game) :
# https://www.chessprogramming.org/Tapered_Eval
PawnPhase   = 0
KnightPhase = 1
BishopPhase = 1
RookPhase   = 2
QueenPhase  = 4
TotalPhase  = PawnPhase   * 16 + \
              KnightPhase *  4 + \
              BishopPhase *  4 + \
              RookPhase   *  4 + \
              QueenPhase  *  2
Phase = {
    PAWN:   PawnPhase,
    KNIGHT: KnightPhase,
    BISHOP: BishopPhase,
    ROOK:   RookPhase,
    QUEEN:  QueenPhase,
    KING:   0
}

def scale_to_white_view(board: Board, eval: int) -> int :
    perspective = 1 if board.turn else -1
    return eval * perspective

def evaluate(board: Board) -> int :
    '''Evaluate a position from the persective of the player'''

    # Evaluation terms initialisation
    whiteEval     = 0 # White's final evaluation
    blackEval     = 0 # Black's final evaluation
    psqtWhite     = 0 # White's positional eval
    psqtBlack     = 0 # Black's positional eval
    whiteBishop   = 0 # for bishop pair bonnus
    blackBishop   = 0 # for bishop pair bonnus
    whiteControll = 0 # not like mobility, but quite like ... (EMPTY sq only)
    blackControll = 0 # not like mobility, but quite like ... (EMPTY sq only)
    phase         = TotalPhase # for endgame weight

    # Let's iterate over each square
    for square in mailbox64 :

        piece = board.board[square]

        if piece != EMPTY :

            type_ = piece_type(piece)

            phase -= Phase[type_] # phase update

            if piece_color(piece) == WHITE : # White eval
                
                if type_ == KING :
                    kingWhite = [psqt_table[KING][0][square], # special PSQT for
                                 psqt_table[KING][1][square]] # king : mg, eg
                    continue
                psqtWhite += psqt_table[type_][square]
                whiteEval += piece_value[type_]
                if type_ == BISHOP : whiteBishop += 1
                

            else : # Black eval

                if type_ == KING :
                    kingBlack = [psqt_table[KING][0][::-1][square], # special
                                 psqt_table[KING][1][::-1][square]] # PSQT, see
                                                                    # above
                    continue
                psqtBlack += psqt_table[type_][::-1][square]
                blackEval += piece_value[type_]
                if type_ == BISHOP : blackBishop += 1

        else : # If square is empty, let's use controll eval

            if board.attack(square, WHITE) : whiteControll += 1
            if board.attack(square, BLACK) : blackControll += 1

    if whiteBishop >= 2 : whiteEval += BISHOP_PAIR_BONNUS
    if blackBishop >= 2 : blackEval += BISHOP_PAIR_BONNUS

    phase = (phase * 256 + (TotalPhase / 2)) / TotalPhase # phase update

    whiteEval += psqtWhite + whiteControll + \
        ((kingWhite[0] * (256 - phase)) + (kingWhite[1] * phase)) / 256
    blackEval += psqtBlack + blackControll + \
        ((kingBlack[0] * (256 - phase)) + (kingBlack[1] * phase)) / 256

    evaluation = whiteEval - blackEval
    perspective = 1 if board.turn else -1

    return int(evaluation) * perspective