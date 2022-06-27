from board import Board
from evaluation import mateValue, evaluate
from constants import *

class Search :

    def __init__(self, board: Board, depth: int=3) -> None :
        
        self.board = board
        self.depth = depth
        self.nodes = 0
        self.pv = list(range(int((self.depth*self.depth + self.depth)/2)+1))
        # For mate distance pruning
        self.base_number_of_moves = len(self.board.move_stack)

    def quiesce(self, alpha: int=-mateValue, beta: int=mateValue) -> int :
        '''A quiescence search'''

        self.nodes += 1
        # return evaluate(self.board)

        # Mate distance pruning
        # Upper bound
        mating_value = mateValue - (self.base_number_of_moves -
                                        len(self.board.move_stack))
        if mating_value <= beta :
            beta = mating_value
            if alpha >= mating_value :
                return mating_value

        # Lower bound
        mating_value = -mateValue + (self.base_number_of_moves - 
                                        len(self.board.move_stack))
        if mating_value >= alpha :
            alpha = mating_value
            if beta <= mating_value : 
                return mating_value

        if self.board.move_count[-1][0] >= 100 : # draw by fifty move rule
            return 0

        stand_pat = evaluate(self.board)

        # normal QSearch stuff
        if (stand_pat >= beta) : # beta cutoff
            return beta
        if (alpha < stand_pat) :
            alpha = stand_pat

        legal = False # To know if there is at least one legal move
        turn = WHITE if self.board.turn else BLACK

        for move in self.board.genPseudoLegalsCaptures() :
            
            # TODO : check extension

            self.board.push(move)
            if piece_type(self.board.board[move & 0b_1111111]) == KING :
                pass # As king moves are always legals in the way we generate
                     # king moves
            if self.board.is_check(turn) : # If the move is not a legal move
                self.board.pop(move)
                continue
            legal = True # The move is a legal move

            score = -self.quiesce(-beta, -alpha)
            self.board.pop(move)

            if score >= beta :
                return beta
            if score > alpha :
                alpha = score

        # End of line (and game) :
        if not legal :

            if self.board.is_check(turn) :
                
                for move in self.board.genPseudoLegalMoves() :
                    self.board.push(move)
                    if piece_type(self.board.board[move & 0b_1111111]) == KING :
                        pass # As king moves are always legals in the way we
                             # generate king moves
                    if self.board.is_check(turn) : # If the move is not legal
                        self.board.pop(move)
                        continue
                    legal = True # The move is a legal move

                    score = -self.quiesce(-beta, -alpha)
                    self.board.pop(move)

                    if score >= beta :
                        return beta
                    if score > alpha :
                        alpha = score
                
                if not legal : # if there is a check that cannot be evaded, it's
                               # checkmate
                    return -mateValue + (self.base_number_of_moves -
                                  len(self.board.move_stack))

            return 0 # If there are no legal move and no check, it's a stalemate


        return alpha  

    def zwSearch(self, beta: int, depth: int) -> int :
        '''fail-hard zero window search, returns either beta-1 or beta'''

        self.nodes += 1

        alpha = beta - 1
        # this is either a cut- or all-node

        # Mate distance pruning
        # Upper bound
        mating_value = mateValue - (self.depth - depth)
        if mating_value <= beta :
            beta = mating_value
            if alpha >= mating_value :
                return mating_value

        # Lower bound
        mating_value = -mateValue + (self.depth - depth)
        if mating_value >= alpha :
            alpha = mating_value
            if beta <= mating_value : 
                return mating_value

        if self.board.move_count[-1][0] >= 100 : # draw by fifty move rule
            return 0

        if depth == 0 :
            return self.quiesce(beta-1, beta)

        legal = False # To know if there is at least one legal move
        turn = WHITE if self.board.turn else BLACK

        for move in self.board.genPseudoLegalMoves() :

            self.board.push(move)
            if piece_type(self.board.board[move & 0b_1111111]) == KING :
                pass # As king moves are always legals in the way we generate
                     # king moves
            if self.board.is_check(turn) : # If the move is not a legal move
                self.board.pop(move)
                continue
            legal = True # The move is a legal move

            score = -self.zwSearch(1-beta, depth - 1)
            self.board.pop(move)        

            if score >= beta :
                return beta # fail-hard beta-cutoff   

        # End of line (and game) :
        if not legal :
            if self.board.is_check(turn) :
                return mating_value
            return 0 # If there are no legal move and no check, it's a stalemate

        return beta-1 # fail-hard, return alpha

    def pvSearch(self, alpha: int=-mateValue, beta: int=mateValue, depth=3,
        pvIndex: int=0) -> int :

        self.nodes += 1

        # Mate distance pruning
        # Upper bound
        mating_value = mateValue - (self.depth - depth)
        if mating_value <= beta :
            beta = mating_value
            if alpha >= mating_value :
                return mating_value
        # Lower bound
        mating_value = -mateValue + (self.depth - depth)
        if mating_value >= alpha :
            alpha = mating_value
            if beta <= mating_value : 
                return mating_value

        if self.board.move_count[-1][0] >= 100 : # draw by fifty move rule
            return 0

        if depth == 0 :
            return self.quiesce(alpha, beta)

        legal = False # To know if there is at least one legal move
        turn = WHITE if self.board.turn else BLACK

        # PV store initialisation :
        self.pv[pvIndex] = 0 # no pv yet
        pvNextIndex = pvIndex + depth
        bSearchPv = True

        for move in self.board.genPseudoLegalMoves() :

            self.board.push(move)
            if piece_type(self.board.board[move & 0b_1111111]) == KING :
                pass # As king moves are always legals in the way we generate
                     # king moves
            if self.board.is_check(turn) : # If the move is not a legal move
                self.board.pop(move)
                continue
            legal = True # The move is a legal move

            if bSearchPv :
                score = -self.pvSearch(-beta, -alpha, depth - 1, pvNextIndex)
            else :
                score = -self.zwSearch(-alpha, depth - 1)
                if ( score > alpha ) : # in fail-soft ... && score < beta ) is
                                       # common
                    # re-search :
                    score = -self.pvSearch(-beta, -alpha, depth-1, pvNextIndex)

            self.board.pop(move)

            if score >= beta :
                return beta # fail-hard beta-cutoff
            if score > alpha :
                alpha = score # alpha acts like max in MiniMax
                bSearchPv = False   # *1)

                # PV store :
                self.pv[pvIndex] = move 

        # End of line (and game) :
        if not legal :
            if self.board.is_check(turn) :
                return mating_value
            return 0 # If there are no legal move and no check, it's a stalemate

        return alpha