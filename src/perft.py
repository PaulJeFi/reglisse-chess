from board import *
import zobrist
import chess
import time

keys = {}
zobrist.init_zobrist()

# https://www.chessprogramming.org/Perft

def perft(board: Board, depth: int) -> int :
    '''Simple perft function'''

    nodes = 0
    if depth == 0 :
        return 1
    for move in board.genPseudoLegalMoves() :
        turn = WHITE if board.turn else BLACK
        board.push(move)
        if piece_type(board.board[move & 0b_1111111]) == KING :
            nodes += perft(board, depth-1)
        elif not board.is_check(turn) :
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
        #fen = board.fen()
        board.push(move)
        if not board.is_check(turn) :
            #node = PERFT(board, depth-1, indent+'\t')
            node = perft(board, depth-1)
            nodes += node
            print(indent + str_move(move), ':', node)
        board.pop(move)
        #print(indent, fen == board.fen())
        #if not fen == board.fen() :
        #    print(fen)
        #    print(board.fen())

    print(indent + "total nodes :", nodes)
    return nodes

def perft_z(board: Board, depth: int) -> int :
    '''Perft function using Zobrist keys'''

    global keys
    
    nodes = 0
    if depth == 0 :
        return 1
    for move in board.genPseudoLegalMoves() :
        turn = WHITE if board.turn else BLACK
        board.push(move)
        key = zobrist.hash(board)
        if key in keys :
            board.pop(move)
            return keys[(key, depth)]
        elif piece_type(board.board[move & 0b_1111111]) == KING :
            keys[(key, depth)] = perft_z(board, depth-1)
            nodes += keys[(key, depth)]
        elif not board.is_check(turn) :
            keys[(key, depth)] = perft_z(board, depth-1)
            nodes += keys[(key, depth)]
        board.pop(move)
    return nodes

# Difficult testing positions from
# https://www.chessprogramming.org/Perft_Results
fen1 = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 0'
fen2 = '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 0'
fen3 = 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1'
fen4 = 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8'
fen5 ='r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10'