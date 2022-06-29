from constants import *

class Board :

    # Here are some Board's attributes :
    board = EMPTY_BOARD.copy() # Mailbox board representation
    turn: bool
    castling_rights: list # 0b_1111 (15)
    ep = []               # -1 for no ep, else square index
    move_count: list      # eg. [0, 0] in the starting position
    move_stack = []       # list of moves made
    
    def __init__(self, fen: str=STARTING_FEN) -> None :
        self.load_fen(fen)

    def load_fen(self, fen: str) -> None :

        # Reset some flags :
        self.ep         = []
        self.move_stack = []
        self.board      = EMPTY_BOARD.copy()
        
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

        # Caslte move :
        if abs(from_ - to_) == 2 and piece_type(self.board[from_]) == KING :
            if to_ == 97 : # White long castle
                self.board[98] = WHITE | ROOK
                self.board[96] = EMPTY
            elif to_ == 93 : # White long castle
                self.board[91] = WHITE | ROOK
                self.board[94] = EMPTY
            elif to_ == 27 : # Black long castle
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
                elif self.board[attacker] == EMPTY :
                    continue
                else :
                    break
                
        # Attacked by Rook or Queen
        for offset in ROOK_VECTOR :
            for i in range(1, 8) :
                attacker = square + offset * i
                if self.board[attacker] == color | ROOK :
                    return True
                if self.board[attacker] == color | QUEEN :
                    return True
                elif self.board[attacker] == EMPTY :
                    continue
                else :
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
                    not self.attack(94, opp) and not \
                        self.attack(93, opp) : # long caslte allowed
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
                    not self.attack(24, opp) and not \
                        self.attack(23, opp) : # long caslte allowed
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
            # A piece can move only is its color is the color side to move
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

    def genPawnCapture(self, square: int, color: int) -> list :
        '''A copy of genPawn, just single and double push are removed.
        Note : queening (or just promotiong a pawn) is here considered as a
        capture move, because material balance changes.'''

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

    def genPseudoLegalCaptures(self) -> list :
        '''Generating pseudo-legal captures only.'''

        moves = []
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
                            moves.append(encode_move(
                                square,
                                to_,
                                0,
                                (self.board[to_] | WHITE|BLACK) ^ (WHITE|BLACK),
                                0
                            ))
        

                # Sliding pieces
                elif piece == BISHOP or piece == ROOK or piece == QUEEN :
                    for offset in SLIDING_VECTORS[piece] :
                        for i in range(1, 8) :
                            to_ = square + i * offset
                            if self.board[to_] == OFF_BOARD or \
                                (self.board[to_] & color) :
                                break
                            elif self.board[to_] != EMPTY :
                                moves.append(encode_move(
                                    square,
                                    to_,
                                    0,
                                    (self.board[to_]|WHITE|BLACK)^(WHITE|BLACK),
                                ))
                                if self.board[to_] != EMPTY :
                                    break

                # Pawn
                elif piece == PAWN :
                    # Promotions moves are added with captures here.
                    moves = [*moves, *self.genPawnCapture(square, color)]

                # King
                elif piece == KING :

                    opp = opp_color(color)

                    # Nomal king moves : remenber, king can't capture with a
                    # castling move
                    for offset in [*BISHOP_VECTOR, *ROOK_VECTOR] :
                        to_ = square + offset
                        if self.board[to_] != OFF_BOARD and \
                            not (self.board[to_] & color) \
                            and not self.attack(to_, opp) \
                                and self.board[to_] != EMPTY :
                            moves.append(encode_move(
                                square,
                                to_,
                                0,
                                (self.board[to_] | WHITE|BLACK) ^ (WHITE|BLACK),
                                0
                            ))

        return moves

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