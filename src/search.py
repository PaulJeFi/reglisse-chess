from board import Board
from constants import *
import zobrist
from evaluation import mateValue, evaluate

zobrist.init_zobrist()


R = 2               # R is the depth reduction when we do a null-move search.
                    # See later.
ttSIZE = 10_000_000 # The size of the transposition table (TT).

# Some hash flag used in TT :
hashEXACT = 0
hashALPHA = 1
hashBETA  = 2
valUNKNOW = 1       # impossible to have eval = 1 in practise

MAX_PLY   = 1024    # ply are used in Killer Moves. See later.

class Entry :
    '''A class that represents a TT entry'''
    key = 0
    depth: int
    value: int
    flag: int

tt = [Entry() for _ in range(ttSIZE)] # TT
# History heuristic store :
history = [
    [[NONE for ___ in range(98+1)] for __ in range(98+1)] for _ in range(2)
]
# Killer move store :
killers = [[NONE, NONE] for _ in range(MAX_PLY)]

# MVV_LLA[attacker][victim]]
MVV_LLA = [
    # Victim      K    Q    R    B    N    P    / Attacker
                [600, 500, 400, 300, 200, 100], #    K
                [601, 501, 401, 301, 201, 101], #    Q
                [602, 502, 402, 302, 202, 102], #    R
                [603, 503, 403, 303, 203, 103], #    B
                [604, 504, 404, 304, 204, 104], #    N
                [605, 505, 405, 305, 205, 105], #    P
]

def ProbeHash(board: Board, depth: int, alpha: int, beta: int,
              hash_=False) -> int :
    '''
    Probe the TT to extract information if it exists about a given position.
    '''

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
    '''Store information about the position in the TT.'''

    global tt
    if not hash_ :
        hash_ = zobrist.hash(board)
    entry = Entry()
    entry.key   = hash_
    entry.value = val
    entry.flag  = flag
    entry.depth = depth
    tt[hash_ % ttSIZE] = entry

def score_move(move: int, board: Board, ply: int) :
    '''A method for move ordering. An heuristic to asigne score to moves to
    search probable best moves at first, so that search is faster.'''

    score = 0
    
    if move & 0b_1_111_000_0000000_0000000 : # If the move is a capture move
        # Apply MVV-LVA scoring. The idea is to say that taking a valuable piece
        # with a smaller piece (like PxQ) is probably better than taking a
        # smaller piece with a valuable one (like QxP).
        if move & 0b_1_000_000_0000000_0000000 : # ep
            return 105 # PxP
        return MVV_LLA[((move >> 17) & 0b_111)-1]\
            [piece_type(board.board[(move >> 7) & 0b_1111111])-1]

    # Else if the move is not a capture move, let's simply use Killer Moves and
    # History Heuristic
    if killers[ply][0] == move :
        score += 9000
    elif killers[ply][1] == move :
        score += 8000
    score +=  history[int(board.turn)][(move & 0b_1111111_0000000) >> 7]\
            [move & 0b_1111111]

    return score

def ordering(board: Board, ply: int, moves) -> list :
    '''A move ordering method. See score_move()'''
    moves = [(move, score_move(move, board, ply)) for move in moves]
    move_list = sorted(moves, key=lambda k: k[1], reverse=True)
    move_list = [move[0] for move in move_list]
    return move_list

class Search :

    def __init__(self, board: Board, depth: int) -> None :
        '''The search class'''

        self.board = board
        self.depth = depth
        self.nodes = 0
        # PV store uses a triangular PV table
        self.pv = list(range(int((self.depth*self.depth + self.depth)/2)+1))
        self.ply = 0

    def pvSearch(self, depth: int, alpha: int=-mateValue,
                  beta: int=mateValue, mate: int=mateValue,
                  pvIndex: int=0, storePV: bool=True,
                  checkFlag: int=0) -> int :
        '''Principal Variation Search'''
        
        global history
        global killers

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
            # if depth is lower than 0, just do a quiescence search
            self.ply += 1
            val =  self.Quiescent(alpha, beta, mate-1)
            RecordHash(self.board, depth, val, hashEXACT, hash_)
            self.ply -= 1
            return val

        if checkFlag == -1 : # QuiescentSearch calls PVSearch only if board is
                             # check
            isCheck = True
        elif checkFlag :
            isCheck = False
        else :
            isCheck = self.board.is_check(turn)
        
        # Null move pruning
        # The idea is that if we don't play and our position is still good for
        # us if our opponent plays, there is no needing to see what's happends
        # if we play since it will probably be good for us. This is a bad idea
        # in zugzwang.
        if not (isCheck  or storePV) :
            self.ply += 1
            self.board.push(NONE) # make a null move
            val = -self.pvSearch(depth-1-R, -beta, -beta+1, mate, storePV=False,
                                 checkFlag=1)
            self.board.pop(NONE)
            self.ply -= 1
            if val >= beta :
                RecordHash(self.board, depth, beta, hashBETA, hash_)
                return beta

        legal = False
        # PV store initialisation :
        if storePV :
            self.pv[pvIndex] = 0 # no pv yet
        pvNextIndex = pvIndex + depth
        
        self.ply += 1
        for move in ordering(self.board, self.ply,
                             self.board.genPseudoLegalMoves()) :
            self.board.push(move)
            if piece_type(self.board.board[move & 0b_1111111]) == KING :
                pass # As king moves are always legal in the way we generate
                     # king moves
            if self.board.is_check(turn) : # If the move is not a legal move
                self.board.pop(move)
                continue
            legal = True # The move is a legal move


            if fFoundPv :
                # If we found the PV, no need to do a full-window search
                val = -self.pvSearch(depth-1, -alpha-1, -alpha, mate-1, 0,
                                     False, 0)
                if val > alpha and val < beta :
                    # If it appears that we found a better move than the
                    # previous PV one, do a normal re-search
                    val = -self.pvSearch(depth-1, -beta, -alpha, mate-1,
                                         pvNextIndex, storePV, 0)
            else :
                val = -self.pvSearch(depth-1, -beta, -alpha, mate-1,
                                     pvNextIndex, storePV, 0)

            self.board.pop(move)

            if val >= beta : # beta cutoff
                RecordHash(self.board, depth, beta, hashBETA, hash_)
                if not move & 0b_1_111_000_0000000_0000000 :
                    # If the move is not a capture one, let's store it as a
                    # killer move. The idea is that if this move create a beta
                    # cutoff now, it can also create a beta cutoff on other
                    # positions, so we could search this move first to create
                    # beta cutoffs and save time.
                    killers[self.ply][1] = killers[self.ply][0]
                    killers[self.ply][0] = move
                self.ply -= 1
                return beta

            if val > alpha :
                hashf = hashEXACT
                alpha = val
                fFoundPv = True
                if not move & 0b_1_111_000_0000000_0000000 :
                    # If the move is not a capture move, let's update history
                    # heuristics. The idea is that if this move is the best on
                    # this position, it could also be the best on others
                    # positions, and searching bests moves first saves time in
                    # search.
                    history[int(self.board.turn)]\
                        [(move & 0b_1111111_0000000) >> 7]\
                            [move & 0b_1111111] += depth ** 2
                # PV store :
                if storePV :
                    self.pv[pvIndex] = move

        # End of line (and game) :
        if not legal :
            if isCheck :
                return -mate
            self.ply -= 1
            return 0 # If there are no legal move and no check, it's a stalemate

        RecordHash(self.board, depth, alpha, hashf, hash_)
        self.ply -= 1
        return alpha

    def Quiescent(self, alpha: int, beta: int, mate: int=mateValue) -> int :
        '''Quiescence search : when search reaches its depth limit, we need to
        be sure to not miss tactics before calling evaluation.'''

        turn = WHITE if self.board.turn else BLACK
        self.nodes += 1
        self.ply += 1

        if self.board.is_check(turn) :
            # Check-evaders extension
            val = self.pvSearch(1, alpha, beta, mate-1, 0, False, -1)
            self.ply -= 1
            return val
        
        # stand pat pruning
        val = evaluate(self.board)
        if val >= beta :
            self.ply -= 1
            return beta
        if val > alpha :
            alpha = val

        for move in ordering(self.board, self.ply,
                             self.board.genPseudoLegalCaptures()) :
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
                self.ply -= 1
                return beta
            if val > alpha :
                alpha = val
        self.ply -= 1

        return alpha