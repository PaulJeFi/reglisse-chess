import time
from board import Board
from constants import str_move
import evaluation
import search
import book

# PV store comes from
# https://www.chessprogramming.org/Triangular_PV-Table
def index_pv(ply: int, depth: int) -> int :
    if ply == 0 : 
        return 0 
    return index_pv(ply-1, depth) + depth - (ply-1)

def iterative_deepening(board: Board, depth: int) -> tuple :

    # Search in the book if possible
    move = book.move_from_book(board)
    if move :
        print(f"bestmove {str_move(move)}")
        return move, 0

    # Current time at starting
    start_time = time.time()
    curr_depth = 0
    nodes = 0

    # Move ordering before search
    tmp_moves = board.genLegal()

    # Best-first move (depth 0) :
    b_move = tmp_moves[0]
    board.push(b_move)
    b_score = evaluation.evaluate(board)
    scaled_score = evaluation.scale_to_white_view(board, b_score)
    board.pop(b_move)

    # UCI report
    print(f'info depth {curr_depth} score cp {int(scaled_score)} nodes {0} nps'+
          f' 0 time {int((time.time()-start_time) * 1000)} pv ' +
          f'{str_move(b_move)}')

    if depth < 1 :
        print(f"bestmove {str_move(b_move)}")
        return b_move, scaled_score

    pv = {}
    last_time = time.time()

    # Move ordering initialisation : depth 1
    moves = []
    curr_depth += 1
    for move in tmp_moves :
        board.push(move)
        searcher = search.Search(board, curr_depth-1)
        tmp_value = searcher.pvSearch(depth=searcher.depth)
        board.pop(move)
        
        nodes += searcher.nodes
        moves.append((move, tmp_value))

        pv[str_move(move)] = " ".join([[str_move(move) for move in searcher.pv]\
            [index_pv(ind, searcher.depth)] for ind in range(searcher.depth)])

    # Remove moves in double
    old_moves = moves
    moves = []
    tmp_moves = []
    for move, value in old_moves :
        if not (move in tmp_moves) :
            moves.append((move, value))
            tmp_moves.append(move)

    # Extract best move and its evaluation
    b_move = moves[0][0]
    board.push(b_move)
    scaled_score = evaluation.scale_to_white_view(board, moves[0][1])
    board.pop(b_move)

    # UCI report
    for ind, (move, value) in enumerate(moves) :
        print(
    f'info depth {curr_depth} currmove {str_move(move)} currmovenumber {ind+1}'
        ) 
    print(f'info depth {curr_depth} score cp {int(scaled_score)} nodes {nodes}'+
          f' nps {int(nodes/(1+time.time()-last_time))} time ' +
          f'{int((time.time()-last_time) * 1000)} pv {str_move(b_move)} ' +
          f'{pv[str_move(b_move)]}')
    last_time = time.time()

    while curr_depth < depth :
        curr_depth += 1

        old_moves = moves
        moves = []
        new_nodes = 0
        for move, forget_this in old_moves :
            board.push(move)
            searcher = search.Search(board, curr_depth-1)
            tmp_value = searcher.pvSearch(depth=searcher.depth)
            board.pop(move)

            nodes += searcher.nodes
            new_nodes += searcher.nodes
            moves.append((move, tmp_value))

            pv[str_move(move)] = " ".join([[str_move(move) for move in
                searcher.pv][index_pv(ind, searcher.depth)] for ind in 
                range(searcher.depth)])

        # Sort moves :
        moves = sorted(moves, key=lambda x: x[1])

        # Remove moves in double
        old_moves = moves
        moves = []
        tmp_moves = []
        for move, value in old_moves :
            if not (move in tmp_moves) :
                moves.append((move, value))
                tmp_moves.append(move)
        
        # Extract best move and its evaluation
        b_move = moves[0][0]
        board.push(b_move)
        scaled_score = evaluation.scale_to_white_view(board, moves[0][1])
        board.pop(b_move)

        # UCI report
        for ind, (move, value) in enumerate(moves) :
            print(f'info depth {curr_depth} currmove {str_move(move)} ' +
                  f'currmovenumber {ind+1}') 
        print(f'info depth {curr_depth} score cp {int(scaled_score)} nodes ' +
              f'{nodes} nps {int(new_nodes/1+(time.time()-last_time))} time ' +
              f'{int((time.time()-last_time)) * 1000} pv {str_move(b_move)} ' +
              f'{pv[str_move(b_move)]}')
        last_time = time.time()

    print(f"bestmove {str_move(b_move)}")
    return b_move, scaled_score