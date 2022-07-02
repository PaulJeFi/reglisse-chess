from board import Board
from constants import *
import zobrist
from evaluation import mateValue, evaluate

zobrist.init_zobrist()


R = 2
ttSIZE = 10_000_000
hashEXACT = 0
hashALPHA = 1
hashBETA  = 2
valUNKNOW = 1 # impossible to have eval = 1 in practise

class Entry :
    key = 0
    depth: int
    value: int
    flag: int

tt = [Entry() for _ in range(ttSIZE)]
history = [
    [[NONE for ___ in range(98+1)] for __ in range(98+1)] for _ in range(2)
]

def ProbeHash(board: Board, depth: int, alpha: int, beta: int,
              hash_=False) -> int :

    if not hash_ :
        hash_ = zobrist.hash(board)
    entry = tt[hash_ % ttSIZE]
    if entry.key == hash_ and entry.depth >= depth :
        if entry.flag == hashEXACT :
            return entry.value
        if entry.flag == hashALPHA and entry.value <= alpha :
            return alpha
        if entry.flag == hashBETA and entry.value >= beta :
            return beta
    return valUNKNOW

def RecordHash(board: Board, depth: int, val: int, flag: int,
               hash_=False) -> None :

    global tt
    if not hash_ :
        hash_ = zobrist.hash(board)
    entry = Entry()
    entry.key   = hash_
    entry.value = val
    entry.flag  = flag
    entry.depth = depth
    tt[hash_ % ttSIZE] = entry

def ordering(board: Board) -> list :
    moves = [(move, history[int(board.turn)][(move & 0b_1111111_0000000) >> 7]\
            [move & 0b_1111111]) for move in board.genPseudoLegalMoves()]
    move_list = sorted(moves, key=lambda k: k[1], reverse=True)
    move_list = [move[0] for move in move_list]
    return move_list

class Search :

    def __init__(self, board: Board, depth: int) -> None :
        self.board = board
        self.depth = depth
        self.nodes = 0
        self.pv = list(range(int((self.depth*self.depth + self.depth)/2)+1))

    def pvSearch(self, depth: int, alpha: int=-mateValue,
                  beta: int=mateValue, mate: int=mateValue,
                  pvIndex: int=0, storePV: bool=True,
                  checkFlag: int=0) -> int :
        
        global history

        # checkFlag : some infomration about check
        #    . 1 -> no check
        #    . 0 -> unknow
        #    .-1 -> is check

        self.nodes += 1
        fFoundPv = False
        hashf = hashALPHA
        turn = WHITE if self.board.turn else BLACK
        hash_ = zobrist.hash(self.board)

        if (not beta - alpha > 1) or (checkFlag == -1) : # Probe TT if node is
                                                         # not a PV node
            # If checkFlag = -1 we know this is a QS-node
            val = ProbeHash(self.board, depth, alpha, beta, hash_)
            if val != valUNKNOW :
                return val

        if depth <= 0 :
            val =  self.Quiescent(alpha, beta, mate-1)
            RecordHash(self.board, depth, val, hashEXACT, hash_)
            return val

        if checkFlag == -1 : # QuiescentSearch calls PVSearch only if board is
                             # check
            isCheck = True
        elif checkFlag :
            isCheck = False
        else :
            isCheck = self.board.is_check(turn)
        
        # Null move pruning
        if not (isCheck  or storePV) :
            self.board.push(NONE) # make a null move
            val = -self.pvSearch(depth-1-R, -beta, -beta+1, mate, storePV=False,
                                 checkFlag=1)
            self.board.pop(NONE)
            if val >= beta :
                RecordHash(self.board, depth, beta, hashBETA, hash_)
                return beta

        legal = False
        # PV store initialisation :
        if storePV :
            self.pv[pvIndex] = 0 # no pv yet
        pvNextIndex = pvIndex + depth
        

        for move in ordering(self.board) :
            self.board.push(move)
            if piece_type(self.board.board[move & 0b_1111111]) == KING :
                pass # As king moves are always legal in the way we generate
                     # king moves
            if self.board.is_check(turn) : # If the move is not a legal move
                self.board.pop(move)
                continue
            legal = True # The move is a legal move


            if fFoundPv :
                val = -self.pvSearch(depth-1, -alpha-1, -alpha, mate-1, 0,
                                     False, 0)
                if val > alpha and val < beta :
                    val = -self.pvSearch(depth-1, -beta, -alpha, mate-1,
                                         pvNextIndex, storePV, 0)
            else :
                val = -self.pvSearch(depth-1, -beta, -alpha, mate-1,
                                     pvNextIndex, storePV, 0)

            self.board.pop(move)

            if val >= beta :
                RecordHash(self.board, depth, beta, hashBETA, hash_)
                if not move & 0b_1_111_000_0000000_0000000 :
                    history[int(self.board.turn)]\
                        [(move & 0b_1111111_0000000) >> 7]\
                            [move & 0b_1111111] += depth ** 2
                return beta

            if val > alpha :
                hashf = hashEXACT
                alpha = val
                fFoundPv = True
                # PV store :
                if storePV :
                    self.pv[pvIndex] = move

        # End of line (and game) :
        if not legal :
            if isCheck :
                return -mate
            return 0 # If there are no legal move and no check, it's a stalemate

        RecordHash(self.board, depth, alpha, hashf, hash_)
        return alpha

    def Quiescent(self, alpha: int, beta: int, mate: int=mateValue) -> int :

        turn = WHITE if self.board.turn else BLACK
        self.nodes += 1

        if self.board.is_check(turn) :
            return self.pvSearch(1, alpha, beta, mate-1, 0, False, -1)
        
        val = evaluate(self.board)
        if val >= beta :
            return beta
        if val > alpha :
            alpha = val

        for move in self.board.genPseudoLegalCaptures() :
            self.board.push(move)
            if piece_type(self.board.board[move & 0b_1111111]) == KING :
                pass # As king moves are always legal in the way we generate
                     # king moves
            if self.board.is_check(turn) : # If the move is not a legal move
                self.board.pop(move)
                continue

            val = -self.Quiescent(-beta, -alpha, mate-1)
            self.board.pop(move)

            if val >= beta :
                return beta
            if val > alpha :
                alpha = val
        return alpha