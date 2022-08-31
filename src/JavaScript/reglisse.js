'use strict';
const DEBUG = false;
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                               CONSTANTS                                    //
//                                                                            //
//   You will find here some chess constants, used to do some strange chess   //
//                         relative computations.                             //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


// Used to place pieces in the starting position :
const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',

// The famous 10 x 12 mailbox, introduced by Robert Hyatt
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
],

      mailbox64 = [
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
    51, 52, 53, 54, 55, 56, 57, 58,
    61, 62, 63, 64, 65, 66, 67, 68,
    71, 72, 73, 74, 75, 76, 77, 78,
    81, 82, 83, 84, 85, 86, 87, 88,
    91, 92, 93, 94, 95, 96, 97, 98
],

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
],

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
],

// Castle mask. This idea comes from TSCP (that's where I saw it at least).
// Initial castling right = 0b1111 (15)
// 0001 White short castle
// 0010 White long  castle
// 0100 Black short castle
// 1000 Black long  castle

// castle_right &= castle_mask[from] & castle_mask[to]
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
],

// Pieces, squares and colors encoding
      EMPTY = 0, NONE = 0,
      OFF_BOARD = -1,

      WHITE  = 0b01000,
      BLACK  = 0b10000,

      KING   = 0b001,
      QUEEN  = 0b010,
      ROOK   = 0b011,
      BISHOP = 0b100,
      KNIGHT = 0b101,
      PAWN   = 0b110,

// Pieces vectors
      ROOK_VECTOR     = [ -1, -10,   1,  10],
      BISHOP_VECTOR   = [-11, - 9,   9,  11],
      KNIGHT_VECTOR   = [-21, -19, -12, - 8,   8,  12,  19,  21],
      SLIDING_VECTORS = [
    0, 0,
    BISHOP_VECTOR.concat(ROOK_VECTOR), // QUEEN
    ROOK_VECTOR,                       // ROOK
    BISHOP_VECTOR,                     // BISHOP
];
// QUEEN = KING = ROOK + BISHOP
// Pawns are a little bit complex to be treated only with vectors ...

// Move encoding : 
// Moves are encoded on 21 bits like that :
//
//   ________ is en-passant
//  |
//  |
//  0 000 000 0000000 0000000
//     |   |     |       |
//     |   |     |       |
//     |   |     |       |________ to square index
//     |   |     |
//     |   |     |________ from square index
//     |   |
//     |   |_____ pomotion type (0 is NONE)         <-----\
//     |                                                   |--  without color
//     |_____ captured piece type (0 is no capture) <-----/

function encode_move(from_, to_, promotion=NONE, captured=NONE, ep=NONE) {
    // A function that encodes moves

    var move  = 0
    move |= to_
    move |= from_     << 7;
    move |= promotion << 14;
    move |= captured  << 17;
    move |= ep        << 20;

    return move;
};

function str_move(move) {
    // Transforms binary move to uci string
    return SQUARE_NAMES[((0b1111111 << 7) & move) >> 7] +
           SQUARE_NAMES[  0b1111111       & move] + 
        [
            '', 0, 'q', 'r', 'b', 'n'
        ][((0b111 << 14) & move) >> 14];
};

function opp_color(color) {
    // Returns the opposite color
    return (WHITE | BLACK) ^ color;
}

function piece_color(piece) {
    return piece & (WHITE | BLACK);
}

function piece_type(piece) {
    return piece & 0b111;
};

function check_number(integer, digit, place) {
    // Used to know some particularities about number ( like same rank or same
    // file)
    // Thanks : 
    //https://stackoverflow.com/questions/72713436/how-to-check-a-specific-digit
    // -in-integer-python/72713495//72713495

    while (place > 1) {
        integer = (integer / 10 ) >> 0;
        place--;
    }

    if (integer == 0) {return false;};
    if (integer % 10 == digit) {return true;} else {return false;};
};

function isNumeric(s) {
    return !isNaN(s - parseFloat(s));
};



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 BOARD                                      //
//                                                                            //
//              Here will be all the board representation stuff,              //
//                  make/unmake moves, and moves generation.                  //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

class Board {

    constructor(fen=STARTING_FEN) {
        
        // Here are some Board's attributes :
        this.board = EMPTY_BOARD.slice();    // Mailbox board representation
        this.turn  = true;                  // Let's say it's White to play
        this.castling_rights = [0b1111];   // 0b1111 (15)
        this.ep = [];                     // -1 for no ep, else square index
        this.move_count = [[0, 0]];      // eg. [0, 0] in the starting position
        this.move_stack = [];           // list of moves made
        this.load_fen(fen);
    };

    load_fen(fen) {

        // Reset some flags :
        this.ep              = [];
        this.move_stack      = [];
        this.board           = EMPTY_BOARD.slice();
        this.castling_rights = [];
        this.move_count      = [0, 0];

        fen = fen.split(' '); // So it will be easier do dissect it

        // Step 1 : initialize every flag that are not relative to piece
        // positions

        // 1.1 : turn
        if (fen[1] == 'w') {this.turn = true} else {this.turn = false};

        // 1.2 : castling rights
        this.castling_rights = [0]
        for (var char = 0; char < fen[2].length; char++) {
            if (fen[2][char] == 'K') {this.castling_rights[0] |= 0b0001};
            if (fen[2][char] == 'Q') {this.castling_rights[0] |= 0b0010};
            if (fen[2][char] == 'k') {this.castling_rights[0] |= 0b0100};
            if (fen[2][char] == 'q') {this.castling_rights[0] |= 0b1000};
        };

        // 1.3 : en-passant square
        if (fen[3] == '-') {this.ep.push(-1)} // No en-passant allowed
        else {this.ep.push(SQUARE_NAMES.indexOf(fen[3]))};

        // 1.4 : move count
        this.move_count = [[Number(fen[4]), Number(fen[5])]];

        // Step 2 : place pieces
        var mail_index = 21
        for (var char = 0; char < fen[0].length; char++) {

            // Error preventer trick
            if (this.board[mail_index] == OFF_BOARD) {mail_index--};

            // Next rank :
            if (fen[0][char] == '/') {
                mail_index += 3;
                continue;
            }

            // Empty squares
            else if (isNumeric(fen[0][char])) {
                mail_index += parseInt(fen[0][char]);
                continue;
            };

            // Place piece
            if        (fen[0][char] == 'K') {
                this.board[mail_index] = WHITE | KING
            } else if (fen[0][char] == 'Q') {
                this.board[mail_index] = WHITE | QUEEN
            } else if (fen[0][char] == 'R') {
                this.board[mail_index] = WHITE | ROOK
            } else if (fen[0][char] == 'B') {
                this.board[mail_index] = WHITE | BISHOP
            } else if (fen[0][char] == 'N') {
                this.board[mail_index] = WHITE | KNIGHT
            } else if (fen[0][char] == 'P') {
                this.board[mail_index] = WHITE | PAWN
            } else if (fen[0][char] == 'k') {
                this.board[mail_index] = BLACK | KING
            } else if (fen[0][char] == 'q') {
                this.board[mail_index] = BLACK | QUEEN
            } else if (fen[0][char] == 'r') {
                this.board[mail_index] = BLACK | ROOK
            } else if (fen[0][char] == 'b') {
                this.board[mail_index] = BLACK | BISHOP
            } else if (fen[0][char] == 'n') {
                this.board[mail_index] = BLACK | KNIGHT
            } else if (fen[0][char] == 'p') {
                this.board[mail_index] = BLACK | PAWN
            };

            // Increment index if not at end of rank
            if (this.board[mail_index+1] != OFF_BOARD) {mail_index++};
        };
    };

    get fen() {
        // Export the fen position of the board

        var fen  = '';

        // Step 1 : find pieces
        var empty_count = 0;
        var str_piece = '';
        for (var square of mailbox64) {

            var piece = this.board[square];

            // Empty square
            if (piece == EMPTY) {empty_count++};

            // Place piece
            if (piece) {

                // Empty count update
                if (empty_count != 0) {
                    fen += empty_count.toString();
                    empty_count = 0;
                };

                if      ((piece & PAWN)   == PAWN)   {str_piece = 'p'}
                else if ((piece & KNIGHT) == KNIGHT) {str_piece = 'n'}
                else if ((piece & BISHOP) == BISHOP) {str_piece = 'b'}
                else if ((piece & ROOK)   == ROOK)   {str_piece = 'r'}
                else if ((piece & QUEEN)  == QUEEN)  {str_piece = 'q'}
                else if ((piece & KING)   == KING)   {str_piece = 'k'};

                if (piece & WHITE) {fen += str_piece.toUpperCase()}
                else {fen += str_piece};
            };

            // Last square of rank
            if ((square % 10) == 8) { // all rank's end squares index end by
                                     // digit 8
                // Empty count update
                if (empty_count != 0) {
                    fen += empty_count.toString();
                    empty_count = 0;
                };
                if (square != 98) {fen += '/'}; // if the square is not the last
                                               // one
            };

        };


        // Step 2 : add flags

        // Step 2.1 : turn
        if (this.turn) {fen += ' w '} else {fen += ' b '};

        // Step 2.2 : castling rights
        if (this.castling_rights[this.castling_rights.length -1] & 0b0001) {
            fen += 'K'
        };
        if (this.castling_rights[this.castling_rights.length -1] & 0b0010) {
            fen += 'Q'
        
        };
        if (this.castling_rights[this.castling_rights.length -1] & 0b0100) {
            fen += 'k'
        };
        if (this.castling_rights[this.castling_rights.length -1] & 0b1000) {
            fen += 'q'
        };
        if (!this.castling_rights[this.castling_rights.length -1]) {fen += '-'};

        // Step 2.3 : en-passant square
        if (SQUARE_NAMES[Math.abs(this.ep[this.ep.length -1])] == '') {
            fen += ' - '
        }
        else {fen += ' ' + SQUARE_NAMES[Math.abs(this.ep[this.ep.length -1])]};

        // Step 2.4 : move count
        fen += this.move_count[this.move_count.length -1][0].toString() + ' ' 
            + this.move_count[this.move_count.length -1][1].toString();

        return fen;
    };

    push(move) {

        var from_ = (move & 0b0_000_000_1111111_0000000) >> 7;
        var to_   =  move & 0b0_000_000_0000000_1111111;

        var piece = this.board[from_];

        // Pawn moves
        if ((piece & PAWN) == PAWN) { // Pawns are special : en-passant,
                                     // promotion

            // 1 : promotion
            var promotion = (move & 0b0_000_111_0000000_0000000) >> 14;
            if (promotion) {
                this.board[to_] = piece_color(this.board[from_]) | promotion;
                this.board[from_] = EMPTY;
                this.ep.push(-1);
            }

            // 2 : double pawn push
            else if (Math.abs(from_ - to_) == 20) {
                this.board[to_] = this.board[from_];
                this.board[from_] = EMPTY;
                this.ep.push(((to_ + from_)/2) >> 0); // En-passant square
            }

            // 3 : en-passant
            else if (move >> 20) {
                this.ep.push(-1);

                if (from_ < to_) { // Black takes White
                    this.board[to_ - 10] = EMPTY;
                    this.board[to_] = this.board[from_];
                    this.board[from_] = EMPTY;
                }

                else { // White takes Black
                    this.board[to_ + 10] = EMPTY;
                    this.board[to_] = this.board[from_];
                    this.board[from_] = EMPTY;
                };
            }

            // 4 : Others pawn moves
            else {
                this.board[to_] = this.board[from_];
                this.board[from_] = EMPTY;
                this.ep.push(-1);
            };
        }

        // King moves
        else if (((piece ^ WHITE) == KING) || ((piece ^ BLACK) == KING)) {

            this.ep.push(-1);
            this.board[to_] = this.board[from_];
            this.board[from_] = EMPTY;

            if (Math.abs(from_ - to_) == 2) { // castle

                if (to_ == 97) { // White's short castle
                    this.board[96] = WHITE | ROOK;
                    this.board[98] = EMPTY;
                }

                else if (to_ == 93) { // White's long castle
                    this.board[94] = WHITE | ROOK;
                    this.board[91] = EMPTY;
                }

                else if (to_ == 27) { // BLack's short castle
                    this.board[26] = BLACK | ROOK;
                    this.board[28] = EMPTY;
                }

                else if (to_ == 23) { // BLack's long castle
                    this.board[24] = BLACK | ROOK;
                    this.board[21] = EMPTY;
                };
            };
        }

        // Other pieces moves
        else {
            this.board[to_] = this.board[from_];
            this.board[from_] = EMPTY;
            this.ep.push(OFF_BOARD);
        };

        // Flags update (note that ep flag is updated while making moves)
        
        // Castling rights update :
        this.castling_rights.push(
            this.castling_rights[this.castling_rights.length - 1] &
            castle_mask[from_] & castle_mask[to_]
        );

        this.turn = !this.turn;
        this.move_stack.push(move);

        // Move count update
        var rule_50 = this.move_count[this.move_count.length - 1][0] + 1;
        var move_count = this.move_count[this.move_count.length - 1][1];
        if ((piece & PAWN) == PAWN) {rule_50 = 0} // pawn move
        else if (move & 0b0_111_000_0000000_0000000) { // capture move
            rule_50 = 0
        };
        if (this.turn) {     // change if Black just played, since we have
            move_count ++   // already updated turn
        }; 
        this.move_count.push([rule_50, move_count]);
    };

    pop(move) {

        var from_         = (move & 0b0_000_000_1111111_0000000) >> 7;
        var to_           =  move & 0b0_000_000_0000000_1111111;
        var captured_type = (move & 0b0_111_000_0000000_0000000) >> 17;

        // Place the moved piece on its starting square
        this.board[from_] = this.board[to_];

        // If the move is a promotion, place a pawn on from_ square
        if (move & 0b0_000_111_0000000_0000000) {
            this.board[from_] = piece_color(this.board[from_]) | PAWN;
        };

        if (move & 0b1_000_000_0000000_0000000) { // If ep move
            this.board[to_] = EMPTY; // To square remains EMPTY
            if (piece_color(this.board[from_]) == WHITE) { // White ep
                this.board[to_ + 10] = BLACK | PAWN;
            }
            else {
                this.board[to_ - 10] = WHITE | PAWN;
            };
        }

        // If the move is a capture move, replace the captured piece
        else if (captured_type) {
            var color = this.turn ? WHITE : BLACK;
            this.board[to_] = color | captured_type;
        }
        // Else (ie no capture move), TO square is EMPTY
        else {
            this.board[to_] = EMPTY;
        };

        // Castle move :
        if ((Math.abs(from_ - to_) == 2) && 
            (piece_type(this.board[from_]) == KING)) {
            if (to_ == 97) { // White short castle
                this.board[98] = WHITE | ROOK;
                this.board[96] = EMPTY;
            }
            else if (to_ == 93) { // White long castle
                this.board[91] = WHITE | ROOK;
                this.board[94] = EMPTY;
            }
            else if (to_ == 27) { // Black short castle
                this.board[28] = BLACK | ROOK;
                this.board[26] = EMPTY;
            }
            else if (to_ == 23) { // Black long castle
                this.board[21] = BLACK | ROOK;
                this.board[24] = EMPTY;
            };
        };

        // Update flags :
        this.turn = !this.turn;
        this.castling_rights.pop();
        this.ep.pop();
        this.move_count.pop();
        this.move_stack.pop();
    };

    attack(square, color) {
        // Determines if color attacks square. Used for example by legal moves
        // verifications

        var attacker = 0;

        // Attacked by Knight
        for (var offset of KNIGHT_VECTOR) {
            attacker = square + offset
            if(this.board[attacker] == (color | KNIGHT)) {
                return true;
            };
        };

        // Attacked by King
        for (var offset of SLIDING_VECTORS[QUEEN]) {
            attacker = square + offset
            if (this.board[attacker] == (color | KING)) {
                return true;
            };
        };

        // Attacked by Bishop or Queen
        for (var offset of BISHOP_VECTOR) { 
            for (var i=1; i<=8; i++) {
                attacker = square + offset * i
                if (this.board[attacker] == (color | BISHOP)) {
                    return true;
                };
                if (this.board[attacker] == (color | QUEEN)) {
                    return true;
                };
                if (this.board[attacker] == EMPTY) {
                    continue;
                };
                break;
            };
        };

        // Attacked by Rook or Queen
        for (var offset of ROOK_VECTOR) { 
            for (var i=1; i<=8; i++) {
                attacker = square + offset * i
                if (this.board[attacker] == (color | ROOK)) {
                    return true;
                };
                if (this.board[attacker] == (color | QUEEN)) {
                    return true;
                };
                if (this.board[attacker] == EMPTY) {
                    continue;
                };
                break;
            };
        };

        // Attacked by pawn
        if (color == WHITE) { // White pawn
            if (this.board[square + 9]  == (WHITE | PAWN)) {
                return true;
            };
            if (this.board[square + 11] == (WHITE | PAWN)) {
                return true;
            };
        }
        else { // BLack pawn
            if (this.board[square - 9]  == (BLACK | PAWN)) {
                return true;
            };
            if (this.board[square - 11] == (BLACK | PAWN)) {
                return true;
            };
        };

        return false;
    };

    genKnight(square, color) {
        // Generation of pseudo-legal moves for a given knight
        
        var moves = [];
        for (var offset of KNIGHT_VECTOR) {
            var to_ = square + offset;
            if ((this.board[to_] != OFF_BOARD) && (!(this.board[to_] & color))){
                moves.push(encode_move(
                    square,
                    to_,
                    0,
                    (this.board[to_] | WHITE | BLACK) ^ (WHITE | BLACK),
                    0
                ));
            };
        };
        return moves;
    };

    genSliding(square, color, VECTOR) {
        // Generation of pseudo-legal moves for a given sliding piece.
        // Sliding pieces = Bishop + Rook + Queen (King too, but more complex)
        
        var moves = [];
        for (var offset of VECTOR) {
            for (var i=1; i<=8; i++) {
                var to_ = square + i * offset
                if ((this.board[to_] == OFF_BOARD) ||
                    (this.board[to_] & color)) {
                    break;
                }
                else {
                    moves.push(encode_move(
                        square,
                        to_,
                        0,
                        (this.board[to_] | WHITE | BLACK) ^ (WHITE | BLACK),
                    ));
                    if (this.board[to_] != EMPTY) { 
                        break;
                    };
                };
            };
        };
        return moves;
    };

    genPawn(square, color) {

        var moves = [];

        // White's pawns
        if (color == WHITE) {

            // Promotion
            if (check_number(square, 3, 2)) { // Pawn on 7-rank

                if (this.board[square - 10] == EMPTY) { // Normal promotion
                    for (var piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square - 10,
                            piece
                        ));
                    };
                };

                // Capture promotion
                if (piece_color(this.board[square - 11]) == BLACK) {
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square - 11,
                            piece,
                            piece_type(this.board[square - 11])
                        ));
                    };
                };
                if (piece_color(this.board[square - 9]) == BLACK) {
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square - 9,
                            piece,
                            piece_type(this.board[square - 9])
                        ));
                    };
                };
            }

            else {

                // If is on its starting square, try double pawn push
                if (check_number(square, 8, 2)) { // pawn on starting square
                    if ((this.board[square - 10] == EMPTY) 
                      && (this.board[square - 20] == EMPTY)) {
                        moves.push(encode_move(
                            square,
                            square - 20
                        ));
                    };
                };

                // Check for single push :
                if (this.board[square - 10] == EMPTY) {
                    moves.push(encode_move(
                        square,
                        square - 10
                    ));
                };

                // Capture move
                if (piece_color(this.board[square - 11]) == BLACK) {
                    moves.push(encode_move(
                        square,
                        square - 11,
                        0,
                        piece_type(this.board[square - 11])
                    ));
                };
                if (piece_color(this.board[square - 9]) == BLACK) {
                    moves.push(encode_move(
                        square,
                        square - 9,
                        0,
                        piece_type(this.board[square - 9])
                    ));
                };

                // En-passant
                if (square - 11 == this.ep[this.ep.length - 1]) {
                    moves.push(encode_move(
                        square,
                        square - 11,
                        0,
                        0, // 0 because in ep, the captured pawn is not on the
                          // target square
                        1
                    ));
                };
                if (square - 9 == this.ep[this.ep.length - 1]) {
                    moves.push(encode_move(
                        square,
                        square - 9,
                        0,
                        0, // 0 because in ep, the captured pawn is not on the
                          // target square
                        1
                    ));
                };
            };
        }

        // Black's pawns
        else {

            // Promotion
            if (check_number(square, 8, 2)) { // Pawn on 2-rank

                if (this.board[square + 10] == EMPTY) { // Normal promotion
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square + 10,
                            piece
                        ));
                    };
                };

                // Capture promotion
                if (piece_color(this.board[square + 11]) == WHITE) {
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square + 11,
                            piece,
                            piece_type(this.board[square + 11])
                        ));
                    };
                };
                if (piece_color(this.board[square + 9]) == WHITE) {
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square + 9,
                            piece,
                            piece_type(this.board[square + 9])
                        ));
                    };
                };
            }

            else {

                // If is on its starting square, try double pawn push
                if (check_number(square, 3, 2)) { // pawn on starting square
                    if ((this.board[square + 10] == EMPTY) 
                      && (this.board[square + 20] == EMPTY)) {
                        moves.push(encode_move(
                            square,
                            square + 20
                        ));
                    };
                };

                // Check for single push :
                if (this.board[square + 10] == EMPTY) {
                    moves.push(encode_move(
                        square,
                        square + 10
                    ));
                };

                // Capture move
                if (piece_color(this.board[square + 11]) == WHITE) {
                    moves.push(encode_move(
                        square,
                        square + 11,
                        0,
                        piece_type(this.board[square + 11])
                    ));
                };
                if (piece_color(this.board[square + 9]) == WHITE) {
                    moves.push(encode_move(
                        square,
                        square + 9,
                        0,
                        piece_type(this.board[square + 9])
                    ));
                };

                // En-passant
                if (square + 11 == this.ep[this.ep.length - 1]) {
                    moves.push(encode_move(
                        square,
                        square + 11,
                        0,
                        0, // 0 because in ep, the captured pawn is not on the
                          // target square
                        1
                    ));
                };
                if (square + 9 == this.ep[this.ep.length - 1]) {
                    moves.push(encode_move(
                        square,
                        square + 9,
                        0,
                        0, // 0 because in ep, the captured pawn is not on the
                          // target square
                        1
                    ));
                };
            };

        };

        return moves;
    };

    genKing(square, color) {
        // Generates LEGAL King moves

        var moves = [];

        var opp = opp_color(color);

        // Normal king moves
        for (var offset of SLIDING_VECTORS[QUEEN]) {
            var to_ = square + offset;
            if ((this.board[to_] != OFF_BOARD) && !(this.board[to_] & color) 
                && !(this.attack(to_, opp))) {
                    moves.push(encode_move(
                        square,
                        to_,
                        0,
                        (this.board[to_] | WHITE | BLACK) ^ (WHITE | BLACK),
                        0
                    ));
            };
        };

        // Castling moves
        if ((color == WHITE) && !(this.attack(square, opp))) { // White king
            if ((this.castling_rights[this.castling_rights.length - 1] & 0b0001)
                && (this.board[96] == EMPTY) && (this.board[97] == EMPTY) &&
                !(this.attack(96, opp) && !(this.attack(97, opp)))) {
                    // Short castle allowed
                    moves.push(encode_move(
                        square,
                        97
                    ));
            };
            if ((this.castling_rights[this.castling_rights.length - 1] & 0b0010)
                && (this.board[93] == EMPTY) && (this.board[94] == EMPTY) &&
                (this.board[92] == EMPTY) && !(this.attack(94, opp) &&
                !(this.attack(93, opp)))) {
                    // Long castle allowed
                    moves.push(encode_move(
                        square,
                        93
                    ));
            };
        };
        if ((color == BLACK) && !(this.attack(square, opp))) { // Black king
            if ((this.castling_rights[this.castling_rights.length - 1] & 0b0100)
                && (this.board[26] == EMPTY) && (this.board[27] == EMPTY) &&
                !(this.attack(26, opp) && !(this.attack(27, opp)))) {
                    // Short castle allowed
                    moves.push(encode_move(
                        square,
                        27
                    ));
            };
            if ((this.castling_rights[this.castling_rights.length - 1] & 0b1000)
                && (this.board[23] == EMPTY) && (this.board[24] == EMPTY) &&
                (this.board[22] == EMPTY) && !(this.attack(24, opp) &&
                !(this.attack(23, opp)))) {
                    // Long castle allowed
                    moves.push(encode_move(
                        square,
                        23
                    ));
            };
        };

        return moves;
    };

    genPseudoLegalMoves() {

        var moves = [];
        var color = this.turn ? WHITE : BLACK;
        var color = BLACK;
        if (this.turn) {
            color = WHITE;
        };

        // Let's iterate over each square
        for (var square of mailbox64) {

            // A piece can move only if its color is the color side to move
            if (piece_color(this.board[square]) == color) {

                var piece = piece_type(this.board[square]); // Extracting the
                                                            // piece type

                // Knight
                if (piece == KNIGHT) {
                    moves = moves.concat(this.genKnight(square, color));
                }

                // Sliding pieces (BISHOP, ROOK, QUEEN)
                else if ((piece == BISHOP) || (piece == ROOK) ||
                         (piece == QUEEN)) {
                    moves = moves.concat(this.genSliding(square, color,
                        SLIDING_VECTORS[piece]));
                }

                // Pawn
                else if (piece == PAWN) {
                    moves = moves.concat(this.genPawn(square, color));
                }

                // King
                else if (piece == KING) {
                    moves = moves.concat(this.genKing(square, color));
                };
            };
        };

        return moves;
    };

    isCheck(color) {
        // Is the color's King in check ?
        // Note : color side has to have a king !

        if (this.attack(this.board.indexOf(KING | color), opp_color(color))) {
            return true;
        };

        return false;
    };

    genPawnCapture(square, color) {
        // A copy of genPawn, just single and double push are removed.
        // Note : queening (or just promotiong a pawn) is here considered as a
        // capture move, because material balance changes.

        var moves = [];

        // White's pawns
        if (color == WHITE) {

            // Promotion
            if (check_number(square, 3, 2)) { // Pawn on 7-rank

                if (this.board[square - 10] == EMPTY) { // Normal promotion
                    for (var piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square - 10,
                            piece
                        ));
                    };
                };

                // Capture promotion
                if (piece_color(this.board[square - 11]) == BLACK) {
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square - 11,
                            piece,
                            piece_type(this.board[square - 11])
                        ));
                    };
                };
                if (piece_color(this.board[square - 9]) == BLACK) {
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square - 9,
                            piece,
                            piece_type(this.board[square - 9])
                        ));
                    };
                };
            }

            else {
                // Capture move
                if (piece_color(this.board[square - 11]) == BLACK) {
                    moves.push(encode_move(
                        square,
                        square - 11,
                        0,
                        piece_type(this.board[square - 11])
                    ));
                };
                if (piece_color(this.board[square - 9]) == BLACK) {
                    moves.push(encode_move(
                        square,
                        square - 9,
                        0,
                        piece_type(this.board[square - 9])
                    ));
                };

                // En-passant
                if (square - 11 == this.ep[this.ep.length - 1]) {
                    moves.push(encode_move(
                        square,
                        square - 11,
                        0,
                        0, // 0 because in ep, the captured pawn is not on the
                          // target square
                        1
                    ));
                };
                if (square - 9 == this.ep[this.ep.length - 1]) {
                    moves.push(encode_move(
                        square,
                        square - 9,
                        0,
                        0, // 0 because in ep, the captured pawn is not on the
                          // target square
                        1
                    ));
                };
            };
        }

        // Black's pawns
        else {

            // Promotion
            if (check_number(square, 8, 2)) { // Pawn on 2-rank

                if (this.board[square + 10] == EMPTY) { // Normal promotion
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square + 10,
                            piece
                        ));
                    };
                };

                // Capture promotion
                if (piece_color(this.board[square + 11]) == WHITE) {
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square + 11,
                            piece,
                            piece_type(this.board[square + 11])
                        ));
                    };
                };
                if (piece_color(this.board[square + 9]) == WHITE) {
                    for (piece of [QUEEN, KNIGHT, BISHOP, ROOK]) {
                        moves.push(encode_move(
                            square,
                            square + 9,
                            piece,
                            piece_type(this.board[square + 9])
                        ));
                    };
                };
            }

            else {
                // Capture move
                if (piece_color(this.board[square + 11]) == WHITE) {
                    moves.push(encode_move(
                        square,
                        square + 11,
                        0,
                        piece_type(this.board[square + 11])
                    ));
                };
                if (piece_color(this.board[square + 9]) == WHITE) {
                    moves.push(encode_move(
                        square,
                        square + 9,
                        0,
                        piece_type(this.board[square + 9])
                    ));
                };

                // En-passant
                if (square + 11 == this.ep[this.ep.length - 1]) {
                    moves.push(encode_move(
                        square,
                        square + 11,
                        0,
                        0, // 0 because in ep, the captured pawn is not on the
                          // target square
                        1
                    ));
                };
                if (square + 9 == this.ep[this.ep.length - 1]) {
                    moves.push(encode_move(
                        square,
                        square + 9,
                        0,
                        0, // 0 because in ep, the captured pawn is not on the
                          // target square
                        1
                    ));
                };
            };

        };
    };

    genPseudoLegalCaptures() {

        var moves  = [],
            color  = board.turn ? WHITE : BLACK,
            offset = 0,
            to_    = 0;

        // Let's iterate over each square
        for (var square of mailbox64) {
            // A piece can move only if its color is the side to move
            if (this.board[square] & color) {

                var piece = piece_type(this.board[square]);

                // Knight
                if (piece == KNIGHT) {
                    for (offset of KNIGHT_VECTOR) {
                        to_ = square + offset;
                        if ((this.board[to_] != OFF_BOARD) &&
                           !(this.board[to_] & color)      &&
                            (this.board[to_] != EMPTY)) {
                            moves.push(encode_move(
                                square,
                                to_,
                                0,
                                (this.board[to_] | WHITE|BLACK) ^ (WHITE|BLACK),
                                0
                            ));
                        };
                    };
                }

                // Sliding pieces
                else if ((piece == BISHOP) || (piece == ROOK) ||
                        (piece == QUEEN)) {
                    for (offset of SLIDING_VECTORS[piece]) {
                        for (var i=1; i<=8; i++) {
                            to_ = square + i * offset;
                            if ((this.board[to_] == OFF_BOARD) ||
                                (this.board[to_] & color)) {
                                    break;
                            }
                            else if (this.board[to_] != EMPTY) {
                                moves.push(encode_move(
                                    square,
                                    to_,
                                    0,
                                    (this.board[to_]|WHITE|BLACK)^(WHITE|BLACK)
                                ));
                                break;
                            };

                        };
                    };
                }

                // Pawn
                else if (piece == PAWN) {
                    // Promotions moves are added with captures here.
                    moves = moves.concat(this.genPawnCapture(square, color));
                }

                // King
                else if (piece == KING) {
                    var opp = opp_color(color)

                    // Normal king moves : remenber, king can't capture with a
                    // castling move.
                    for (offset of SLIDING_VECTORS[QUEEN]) {
                        to_ = square + offset;
                        if ((this.board[to_] != OFF_BOARD) &&
                           !(this.board[to_] & color)      &&
                           !(this.attack(to_, opp))        &&
                            (this.board[to_] != EMPTY)) {
                            moves.push(encode_move(
                                square,
                                to_,
                                0,
                                (this.board[to_] | WHITE|BLACK) ^ (WHITE|BLACK),
                                0
                            ));
                        };
                    };
                };

            };
        };
        return moves;
    };

    genLegal() {
        var moves = [];
        for (var move of this.genPseudoLegalMoves()) {
            var turn = board.turn ? WHITE : BLACK;
            this.push(move);
            if (!this.isCheck(turn)) {
                moves.push(move);
            };
            this.pop(move);
        };
        return moves;
    };

    readMove(move) {
        // Convert UCI move to encoded move (int)

        for (var Move of this.genLegal()) {
            if (str_move(Move) == move) {
                return Move;
            };
        };

        console.error('Illegal move :' + move);
    };
};


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 PERFT                                      //
//                                                                            //
//      The perft function is a way to debug make/unmake moves and moves      //
//                 generation and to test their performances.                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function perft(board, depth) {
    // Simple perft function

    var nodes = 0;
    if (depth == 0) {
        return 1;
    };
    for (var move of board.genPseudoLegalMoves()) {
        var turn = board.turn ? WHITE : BLACK;
        board.push(move);
        if (!board.isCheck(turn)) {
            nodes += perft(board, depth-1);
        };
        board.pop(move);
    };
    return nodes;
};

function PERFT(board, depth, indent='') {
    // Detailled perft function

    var nodes = 0;
    if (depth == 0) {
        return 1;
    };
    for (var move of board.genPseudoLegalMoves()) {
        var turn = board.turn ? WHITE : BLACK;
        board.push(move);
        if (!board.isCheck(turn)) {
            //var node = PERFT(board, depth-1, indent+'\t');
            var node = perft(board, depth-1);
            nodes += node;
            console.log(indent + str_move(move) + ' : ' + node.toString());
        };
        board.pop(move)
    };
    console.log('\n' + indent + 'Nodes searched : ' + nodes.toString());
    return nodes;
};

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                EVALUATION                                  //
//                                                                            //
//           The evaluation function gives a score to a given board.          //
//                      Here, peSTO evaluation is used.                       //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
var SKILL = 20;

function skill() {
    return Math.random() * (SKILL - 20) * 200 - (SKILL - 20) * 100;
};

function FLIP(sq) {return sq ^56;};

const mateValue = 100_000_000_000-1,

// Pieces values :
      mg_value = [82, 337, 365, 477, 1025,  0, EMPTY].reverse(),
      eg_value = [94, 281, 297, 512,  936,  0, EMPTY].reverse(),

// PSQT :
      mg_pawn_table = [
      0,   0,   0,   0,   0,   0,  0,   0,
     98, 134,  61,  95,  68, 126, 34, -11,
     -6,   7,  26,  31,  65,  56, 25, -20,
    -14,  13,   6,  21,  23,  12, 17, -23,
    -27,  -2,  -5,  12,  17,   6, 10, -25,
    -26,  -4,  -4, -10,   3,   3, 33, -12,
    -35,  -1, -20, -23, -15,  24, 38, -22,
      0,   0,   0,   0,   0,   0,  0,   0,
],

      eg_pawn_table = [
      0,   0,   0,   0,   0,   0,   0,   0,
    178, 173, 158, 134, 147, 132, 165, 187,
     94, 100,  85,  67,  56,  53,  82,  84,
     32,  24,  13,   5,  -2,   4,  17,  17,
     13,   9,  -3,  -7,  -7,  -8,   3,  -1,
      4,   7,  -6,   1,   0,  -5,  -1,  -8,
     13,   8,   8,  10,  13,   0,   2,  -7,
      0,   0,   0,   0,   0,   0,   0,   0,
],

      mg_knight_table = [
    -167, -89, -34, -49,  61, -97, -15, -107,
     -73, -41,  72,  36,  23,  62,   7,  -17,
     -47,  60,  37,  65,  84, 129,  73,   44,
      -9,  17,  19,  53,  37,  69,  18,   22,
     -13,   4,  16,  13,  28,  19,  21,   -8,
     -23,  -9,  12,  10,  19,  17,  25,  -16,
     -29, -53, -12,  -3,  -1,  18, -14,  -19,
    -105, -21, -58, -33, -17, -28, -19,  -23,
],

      eg_knight_table = [
    -58, -38, -13, -28, -31, -27, -63, -99,
    -25,  -8, -25,  -2,  -9, -25, -24, -52,
    -24, -20,  10,   9,  -1,  -9, -19, -41,
    -17,   3,  22,  22,  22,  11,   8, -18,
    -18,  -6,  16,  25,  16,  17,   4, -18,
    -23,  -3,  -1,  15,  10,  -3, -20, -22,
    -42, -20, -10,  -5,  -2, -20, -23, -44,
    -29, -51, -23, -15, -22, -18, -50, -64,
],

      mg_bishop_table = [
    -29,   4, -82, -37, -25, -42,   7,  -8,
    -26,  16, -18, -13,  30,  59,  18, -47,
    -16,  37,  43,  40,  35,  50,  37,  -2,
     -4,   5,  19,  50,  37,  37,   7,  -2,
     -6,  13,  13,  26,  34,  12,  10,   4,
      0,  15,  15,  15,  14,  27,  18,  10,
      4,  15,  16,   0,   7,  21,  33,   1,
    -33,  -3, -14, -21, -13, -12, -39, -21,
],

      eg_bishop_table = [
    -14, -21, -11,  -8, -7,  -9, -17, -24,
     -8,  -4,   7, -12, -3, -13,  -4, -14,
      2,  -8,   0,  -1, -2,   6,   0,   4,
     -3,   9,  12,   9, 14,  10,   3,   2,
     -6,   3,  13,  19,  7,  10,  -3,  -9,
    -12,  -3,   8,  10, 13,   3,  -7, -15,
    -14, -18,  -7,  -1,  4,  -9, -15, -27,
    -23,  -9, -23,  -5, -9, -16,  -5, -17,
],

      mg_rook_table = [
     32,  42,  32,  51, 63,  9,  31,  43,
     27,  32,  58,  62, 80, 67,  26,  44,
     -5,  19,  26,  36, 17, 45,  61,  16,
    -24, -11,   7,  26, 24, 35,  -8, -20,
    -36, -26, -12,  -1,  9, -7,   6, -23,
    -45, -25, -16, -17,  3,  0,  -5, -33,
    -44, -16, -20,  -9, -1, 11,  -6, -71,
    -19, -13,   1,  17, 16,  7, -37, -26,
],

      eg_rook_table = [
    13, 10, 18, 15, 12,  12,   8,   5,
    11, 13, 13, 11, -3,   3,   8,   3,
     7,  7,  7,  5,  4,  -3,  -5,  -3,
     4,  3, 13,  1,  2,   1,  -1,   2,
     3,  5,  8,  4, -5,  -6,  -8, -11,
    -4,  0, -5, -1, -7, -12,  -8, -16,
    -6, -6,  0,  2, -9,  -9, -11,  -3,
    -9,  2,  3, -1, -5, -13,   4, -20,
],

      mg_queen_table = [
    -28,   0,  29,  12,  59,  44,  43,  45,
    -24, -39,  -5,   1, -16,  57,  28,  54,
    -13, -17,   7,   8,  29,  56,  47,  57,
    -27, -27, -16, -16,  -1,  17,  -2,   1,
     -9, -26,  -9, -10,  -2,  -4,   3,  -3,
    -14,   2, -11,  -2,  -5,   2,  14,   5,
    -35,  -8,  11,   2,   8,  15,  -3,   1,
     -1, -18,  -9,  10, -15, -25, -31, -50,
],

      eg_queen_table = [
     -9,  22,  22,  27,  27,  19,  10,  20,
    -17,  20,  32,  41,  58,  25,  30,   0,
    -20,   6,   9,  49,  47,  35,  19,   9,
      3,  22,  24,  45,  57,  40,  57,  36,
    -18,  28,  19,  47,  31,  34,  39,  23,
    -16, -27,  15,   6,   9,  17,  10,   5,
    -22, -23, -30, -16, -16, -23, -36, -32,
    -33, -28, -22, -43,  -5, -32, -20, -41,
],

      mg_king_table = [
    -65,  23,  16, -15, -56, -34,   2,  13,
     29,  -1, -20,  -7,  -8,  -4, -38, -29,
     -9,  24,   2, -16, -20,   6,  22, -22,
    -17, -20, -12, -27, -30, -25, -14, -36,
    -49,  -1, -27, -39, -46, -44, -33, -51,
    -14, -14, -22, -46, -44, -30, -15, -27,
      1,   7,  -8, -64, -43, -16,   9,   8,
    -15,  36,  12, -54,   8, -28,  24,  14,
],

      eg_king_table = [
    -74, -35, -18, -18, -11,  15,   4, -17,
    -12,  17,  14,  17,  17,  38,  23,  11,
     10,  17,  23,  15,  20,  45,  44,  13,
     -8,  22,  24,  27,  26,  33,  26,   3,
    -18,  -4,  21,  24,  27,  23,   9, -11,
    -19,  -3,  11,  21,  23,  16,   7,  -9,
    -27, -11,   4,  13,  14,   4,  -5, -17,
    -53, -34, -21, -11, -28, -14, -24, -43
],

      mg_tot_table = [
    mg_pawn_table,
    mg_knight_table,
    mg_bishop_table,
    mg_rook_table,
    mg_queen_table,
    mg_king_table, []
].reverse(),

      eg_tot_table = [
    eg_pawn_table,
    eg_knight_table,
    eg_bishop_table,
    eg_rook_table,
    eg_queen_table,
    eg_king_table, []
].reverse(),

// Pieces indexing
      PIECES = [
//                             wk wq wr wb wn wp       bk  bq  br bb bn bp
    0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 4, 3, 2, 1, 0, 0, 0, 11, 10, 9, 8, 7, 6
],

// For tapered eval
      gamephaseInc = [0, 0, 1, 1, 1, 1, 2, 2, 4, 4, 0, 0];

var mg_table = [],
    eg_table = [];

for (var i=0; i<12; i++) {
    mg_table.push([]);
    eg_table.push([]);
    for (var j=0; j<64; j++) {
        mg_table[i].push(0);
        eg_table[i].push(0);
    };
};

for (var piece of [PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING]) {
    for (var sq=0; sq<64; sq++) {
        mg_table[PIECES[piece | WHITE]][sq] = mg_value[piece] +
            mg_tot_table[piece][sq];
        mg_table[PIECES[piece | BLACK]][sq] = mg_value[piece] +
            mg_tot_table[piece][FLIP(sq)];
        eg_table[PIECES[piece | WHITE]][sq] = eg_value[piece] +
            eg_tot_table[piece][sq];
        eg_table[PIECES[piece | BLACK]][sq] = eg_value[piece] +
            eg_tot_table[piece][FLIP(sq)];
    };
};

function evaluate(board) {

    var mg = [0, 0],
        eg = [0, 0],
        gamePhase = 0,
        piece = 0;

    for (var sq=0; sq<64; sq++) {
        piece = board.board[mailbox64[sq]]
        if (piece != EMPTY) {
            mg[piece_color(piece) >> 4] += mg_table[PIECES[piece]][sq];
            eg[piece_color(piece) >> 4] += eg_table[PIECES[piece]][sq];
            gamePhase += gamephaseInc[PIECES[piece]];
        };
    };

    var side2move = board.turn ? 0 : 1;

    var mgScore = mg[side2move] - mg[side2move ^ 1],
        egScore = eg[side2move] - eg[side2move ^ 1],
        mgPhase = Math.min(gamePhase, 24),
        egPhase = 24 - mgPhase;
    
        return (((mgScore * mgPhase + egScore * egPhase) / 24) + 
                 (SKILL != 20 ? skill() : 0))>> 0;
};


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                             ZOBRIST HASHING                                //
//                                                                            //
// Zobrist hashing is a way to represent the board by a quite unique integer. //
//                  This is usefull for Transposition Table.                  //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


function getRandom32bits() {
    return Math.random()*2**31>>>0;
};

var zobrist_table = [];

function init_zobrist() {
    // fill a table of random numbers/bitstrings
    for (var i=0; i<64; i++) {
        zobrist_table.push([]);
        for (var j=0; j<12; j++) {
            zobrist_table[i].push([]);
            zobrist_table[i][j] = getRandom32bits()
        };
    };
    zobrist_table.black_to_move = getRandom32bits();
};

function hash(board) {
    // Compute the hash key of the board
    var h = 0,
        j = 0;
    if (!board.turn) {
        h ^= zobrist_table.black_to_move;
    };
    if (board.ep[board.ep.length - 1] != OFF_BOARD) {
        h ^= board.ep[board.ep.length - 1]
    };
    for (var square=0; square<64; square++) {
        if (board.board[mailbox64[square]] != EMPTY) {
            j = board.board[mailbox64[square]];
            h ^= zobrist_table[square][PIECES[j]];
        };
    };
    return h ^ board.castling_rights[board.castling_rights.length - 1]
};



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 SEARCH                                     //
//                                                                            //
//         Search is the algorithm that try to find the best moves.           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

init_zobrist();

var ttSIZE = 838860;  // The size of the transposition table (TT).
const R = 2,          // R is the depth reduction when we do a null-move search.
                      // See later.
// Some hash flag used in TT :
hashEXACT    = 0,
hashALPHA    = 1,
hashBETA     = 2,
valUNKNOW    = 1.5,   // impossible to have eval = 1.5 in practise
hash_NO_NULL = 2.5,   // impossible to have eval = 2.5 in practise

MAX_PLY      = 1024;  // ply are used in Killer Moves. See later.

class Entry {
    // A class that represents a TT entry.
    constructor() {
        this.key    = 0;
        this.noNull = false;
        this.depth  = 0;
        this.value  = 0;
        this.flag   = 0;
        this.move   = 0;
    };
};

var tt    = [], // TT
history_h = [], // History heuristic store
killers   = []; // Killer move store

function reset_tables() {
    tt        = []; // TT
    history_h = [], // History heuristic store
    killers   = []; // Killer move store

    for (var i=0; i<ttSIZE; i++) {
        tt.push(new Entry());
    };

    for (var i=0; i<2; i++) {
        history_h.push([]);
        for (var j=0; j<98+1; j++) {
            history_h[i].push([]);
            for (var k=0; k<98+1; k++) {
                history_h[i][j].push(NONE);
            };
        };
    };

    for (var i=0; i<MAX_PLY; i++) {
        killers.push([NONE, NONE]);
    };
};

function setHashSize(Mb) {
    // Set the hash size (thanks to WukongJS)

    // adjust MB if going beyond the aloowed bounds
    Mb = Math.max(4, Math.min(Mb, 256));
    
    ttSIZE = (Mb * 0x100000 / 20)>>0;
    reset_tables();
};

reset_tables();

// MVV_LVA[attacker][victim]
const MVV_LVA = [
    // Victim     K    Q    R    B    N    P    / Attacker
                [600, 500, 400, 300, 200, 100], //   K
                [601, 501, 401, 301, 201, 101], //   Q
                [602, 502, 402, 302, 202, 102], //   R
                [603, 503, 403, 303, 203, 103], //   B
                [604, 504, 404, 304, 204, 104], //   N
                [605, 505, 405, 305, 205, 105], //   P
];

function ProbeHash(board, depth, alpha, beta, hash_=false) {
    // Probe the TT to extract information if it exists about a given position.

    if (!hash_) {
        hash_ = hash(board);
    };
    var entry = tt[hash_ % ttSIZE];
    if ((entry.key == hash_) && (entry.depth >= depth)) {
        if (entry.flag == hash_NO_NULL) {
            return hash_NO_NULL;
        };
        if (entry.flag == hashEXACT) {
            return entry.value;
        };
        if ((entry.flag == hashALPHA) && (entry.value <= alpha)) {
            return alpha;
        };
        if ((entry.flag == hashBETA) && (entry.value >= beta)) {
            return beta;
        };
    };
    return valUNKNOW;
};

function RecordHash(board, depth, val, flag, hash_=false, best_move=0) {
    // Store information about the position in the TT.

    if (!hash_) {
        hash_ = hash(board);
    };
    var entry = new Entry();
    entry.key   = hash_;
    entry.value = val;
    entry.flag  = flag;
    entry.depth = depth;
    entry.move  = best_move
    tt[hash_ % ttSIZE] = entry;
};

function score_move(move, board, ply, best_move=0) {
    // A method for move ordering. An heuristic to assign score to moves to
    // search probable best moves at first, so that search is faster.

    var score = 0;

    if (move == best_move) {
        return mateValue;
    };

    if (move & 0b0_1_111_000_0000000_0000000) { // If the move is a capture
                                                // move
        // Apply MVV-LVA scoring. The idea is to say that taking a valuable
        // piece with a smaller piece (like PxQ) is probably better than taking
        // a smaller piece with a valuable one (like QxP).
        if (move & 0b0_1_000_000_0000000_0000000) { // ep
            return 105; // PxP
        };
        return MVV_LVA[((move >> 17) & 0b111)-1][piece_type(
            board.board[(move >> 7) & 0b1111111])-1];
    };

    // Else if the move is not a capture move, let's simply use Killer Moves and
    // History Heuristic
    if (killers[ply][0] == move) {
        score += 9000;
    } else if (killers[ply][1] == move) {
        score += 8000;
    };
    score +=  history_h[board.turn >> 0][(move & 0b0_1111111_0000000) >> 7]
            [move & 0b0_1111111];

    if (score == 0) {
        var view = board.turn ? 1 : -1;
        score = evaluate(board) * view;
    };

    return score;
};

function ordering(board, ply, moves, hash_=false) {
    // A move ordering method. See score_move()
    var best_move = 0;
    if (hash_) {
        var entry = tt[hash_ % ttSIZE];
        if (entry.key == hash_) {
            best_move = entry.move;
        };
    };
    var Moves = [];
    for (var move of moves) {
        Moves.push([move, score_move(move, board, ply, best_move)]);
    };
    Moves.sort(function(a, b){return a[1] > b[1] ? -1 : 1;});
    for (var i=0; i<Moves.length; i++) {
        Moves[i] = Moves[i][0];
    };

    return Moves;
};

// PV store comes from
// https://www.chessprogramming.org/Triangular_PV-Table
function index_pv(ply, depth) {
    if (ply == 0) {  
        return 0
    };
    return index_pv(ply-1, depth) + depth - (ply-1);
};

class Search {
    // The search class

    constructor(board, depth, time=Infinity) {
        this.board = board;
        this.depth = depth;
        this.nodes = 0;
        // PV store uses a triangular PV table
        this.pv = [];
        for (var i=0; i<((((this.depth*this.depth + this.depth)/2)+1) >> 0); 
            i++) {
            this.pv.push(0);
        };
        this.ply = board.move_stack.length;

        // Time management
        this.timeout        = false;
        this.startTime      = new Date().getTime();
        this.time_to_search = time;
    };


    pvSearch(depth, alpha=-mateValue, beta=mateValue, mate=mateValue, pvIndex=0,
             storePV=true, checkFlag=0, realdepth=0) {
        // Principal Variation Search
        
        // checkFlag : some infomration about check
        //    . 1 -> no check
        //    . 0 -> unknow
        //    .-1 -> is check
        if (depth == this.depth) {
            realdepth = this.depth;
        };

        this.nodes++;
        var fFoundPv = false,
            hashf    = hashALPHA,
            turn     = this.board.turn ? WHITE : BLACK,
            hash_    = hash(this.board),
            no_null  = false;
        
        var val = 0;
        
        if (!(beta - alpha > 1) || (checkFlag == -1)) { // Probe TT if
                                                        // node is not a PV node
            // If checkFlag = -1 we know this is a QS-node
            val = ProbeHash(this.board, depth, alpha, beta, hash_);
            if (val == hash_NO_NULL) {
                no_null = true;
            } else if (val != valUNKNOW) {
                return val;
            };
        };

        // Time out checkup
        if ((this.nodes % 1024 == 0) || this.timeout) { // check timeout
                                                             // every 1024 nodes
            if ((new Date().getTime()) - this.startTime >= this.time_to_search){
                this.timeout = true;
                return 0;
            };
        };

        if (depth <= 0) {
            // if depth is lower than 0, just do a quiescence search
            this.ply++;
            val = this.Quiescent(alpha, beta, mate-1);
            RecordHash(this.board, depth, val, hashEXACT, hash_);
            this.ply--;
            return val;
        };

        var isCheck = 0;
        if (checkFlag == -1) { // QuiescentSearch calls PVSearch only if board
                               // is in check
            isCheck = true;
        } else if (checkFlag) {
            isCheck = false;
        } else {
            isCheck = this.board.isCheck(turn);
        };

        // Razoring (old pruning method, today quite unused because risky ...)
        var value = evaluate(this.board) + 125;
        if ((value < beta) && !(isCheck || storePV)) {
            if (depth == 1) {
                this.ply++;
                var new_value = this.Quiescent(alpha, beta, mate-1);
                this.ply--;
                value = Math.max(new_value, value);
                RecordHash(this.board, depth, value, hashf, hash_);
                return value;
            };
            value += 175;
            if ((value < beta) && (depth <= 3)) {
                this.ply++;
                var new_value = this.Quiescent(alpha, beta, mate-1);
                this.ply--;
                if (new_value < beta) {
                    value = Math.max(new_value, value);
                    RecordHash(this.board, depth, value, hashf, hash_);
                    return value;
                };
            };
        };

        // Futility pruning : at pre fontier nodes (depth = 1), if the score
        // plus a bishop value is not better than alpha, simply return alpha.
        if ((depth <= 1) && (!(isCheck  || storePV)) &&
            (!(this.board.move_stack[this.board.move_stack.length - 1] &
                0b0_1_111_111_0000000_0000000)) &&
                (this.board.genLegal().length) && (val < alpha - 320)) {
            RecordHash(this.board, depth, alpha, hashf, hash_);
            return alpha;
        };
        
        // Null move pruning (double null move pruning)
        // The idea is that if we don't play and our position is still good for
        // us if our opponent plays, there is no needing to see what's happends
        // if we play since it will probably be good for us. This is a bad idea
        // in zugzwang.
        if (!(isCheck || storePV || no_null) &&
            (this.board.move_stack.length >= 1) &&
            (this.board.move_stack[this.board.move_stack - 1])) {

            this.ply++;
            this.board.push(NONE); // make a null move
            val = -this.pvSearch(depth-1-R, -beta, -beta+1, mate,
                storePV=false, checkFlag=1, realdepth=realdepth-1);
            this.board.pop(NONE);
            this.ply--;
            if (val >= beta) {
                RecordHash(this.board, depth, beta, hashBETA, hash_);
                return beta;
            };
            // If null move pruning fails, we strore this information so we will
            // no loose time trying null move pruning in this position at same
            // or lower depth in the future.
            RecordHash(this.board, depth, NONE, hash_NO_NULL, hash_);
        };

        var legal     = 0;
        var best_move = 0;
        // PV store in itialisation :
        if (storePV) {
            this.pv[pvIndex] = 0 // no PV yet
        };
        var pvNextIndex = pvIndex + realdepth;

        this.ply++;
        for (var move of ordering(this.board, this.ply,
            this.board.genPseudoLegalMoves())) {

            this.board.push(move);

            if (this.board.isCheck(turn)) { // If the move is not a legal move
                this.board.pop(move);
                continue;
            };
            legal++; // The move is a legal move

            if (fFoundPv) {
                // If we found the PV, no need to do a full-window search
                val = -this.pvSearch(depth-1, -alpha-1, -alpha, mate-1, 0,
                    false, 0, realdepth-1);
                if ((val > alpha) && (val < beta)) {
                    // If it appears that we found a better move than the
                    // previous PV one, do a normal re-search
                    val = -this.pvSearch(depth-1, -beta, -alpha, mate-1,
                        pvNextIndex, storePV, 0, realdepth-1)
                };
            } else {
                val = -this.pvSearch(depth-1, -beta, -alpha, mate-1,
                    pvNextIndex, storePV, 0, realdepth-1);
            };

            this.board.pop(move);

            if (val >= beta) { // beta cutoff
                RecordHash(this.board, depth, beta, hashBETA, hash_, move);
                if (!(move & 0b0_1_111_000_0000000_0000000)) {
                    // If the move is not a capture one, let's store it as a
                    // killer move. The idea is that if this move create a beta
                    // cutoff now, it can also create a beta cutoff on other
                    // positions, so we could search this move first to create
                    // beta cutoffs and save time.
                    killers[this.ply][1] = killers[this.ply][0];
                    killers[this.ply][0] = move;
                };
                this.ply--;
                return beta;
            };

            if (val > alpha) {
                hashf = hashEXACT;
                alpha = val;
                fFoundPv = true;
                if (!(move & 0b0_1_111_000_0000000_0000000)) {
                    // If the move is not a capture move, let's update history
                    // heuristics. The idea is that if this move is the best on
                    // this position, it could also be the best on others
                    // positions, and searching bests moves first saves time in
                    // search.
                    history_h[this.board.turn >> 0][(move & 0b0_1111111_0000000)
                        >> 7][move & 0b0_1111111] += depth ** 2;
                };

                // PV store :
                if (storePV) {
                    this.pv[pvIndex] = move;
                };
                best_move = move // To store the best move in TT
            };

            // Late move reduction. With move ordering, latest moves are 
            // probably the worste. So decrease a little bit depth each time a
            // legal move is searched.
            if (!(isCheck  || storePV) && legal) {
                depth -= 0.2;
            };


        };

        // End of line (and game) :
        if (!legal) {
            this.ply--;
            if (isCheck) {
                return -mate;
            };
            return 0;
        };

        RecordHash(this.board, depth, alpha, hashf, hash_, best_move)
        this.ply--;
        return alpha;

    };

    Quiescent(alpha, beta, mate=mateValue) {
        // Quiescence search : when search reaches its depth limit, we need to
        // be sure to not miss tactics before calling evaluation.

        var turn = this.board.turn ? WHITE : BLACK;
        this.nodes++;
        this.ply++;
        var val = 0;

        if (this.board.isCheck(turn)) {
            // Check-evaders extension
            val = this.pvSearch(1, alpha, beta, mate-1, 0, false, -1);
            this.ply--;
            return val;
        };

        // stand pat pruning
        val = evaluate(this.board);
        if (val >= beta) {
            this.ply--;
            return beta;
        };

        // delta pruning
        var delta = 900; // queen value
        if (val < alpha - delta) {
            this.ply--;
            return alpha;
        };

        if (val > alpha) {
            alpha = val;
        };

        // hard cutoff
        if (this.depth*2 < this.ply - this.depth*2) {
            this.ply--;
            return alpha; // or val ?
        };

        // Time out checkup
        if ((this.nodes % 1024 == 0) || this.timeout) { // check timeout
                                                             // every 1024 nodes
            if ((new Date().getTime()) - this.startTime >= this.time_to_search){
                this.timeout = true;
                return 0;
            };
        };

        for (var move of ordering(this.board, this.ply,
            this.board.genPseudoLegalCaptures())) {
            this.board.push(move);

            if (this.board.isCheck(turn)) { // if the move is not a legal one
                this.board.pop(move);
                continue;
            };

            val = -this.Quiescent(-beta, -alpha, mate-1);
            this.board.pop(move);

            if (val >= beta) {
                this.ply--;
                return beta;
            };
            if (val > alpha) {
                alpha = val;
            };
        };

        this.ply--;
        return alpha;
    };

    collect_PV(str=true) {
        // Return the PV in the str or move format
        var line = '',
            PV   = [],
            move = 0;
        for (var i=0; i<this.depth; i++) {
            move = this.pv[index_pv(i, this.depth)];
            if (move == 0) {
                break;
            };
            line += str_move(move) + ' ';
            PV.push(move);
        };

        if (str) {
            return line;
        };
        return PV;
    };

};

function display_eval(evaluation) {
    if (( evaluation >= mateValue - MAX_PLY) ||
        (-evaluation >= mateValue - MAX_PLY)) {
            return 'mate ' + ((evaluation >= 0 ? 1 : -1) * Math.ceil((mateValue
                - Math.abs(evaluation))/2)).toString();
        };
    return 'cp ' + evaluation;
};

function iterative_deepening(board, depth=4, time=false) {

    var startTime = new Date().getTime();
    var searcher = 0;
    var old_searcher = 0;
    var evaluation = 0;
    var old_evaluation = 0;
    var elapsed = 0;
    var old_elapsed = 0;
    var view = board.turn ? 1 : -1;

    if (time) {
        depth = MAX_PLY;
    } else {
        time = Infinity;
    };
    
    for (var curr_depth=1; curr_depth<=depth; curr_depth++) {

        searcher = new Search(board, curr_depth, time - elapsed);
        evaluation = searcher.pvSearch(searcher.depth);
        elapsed = (new Date().getTime()) - startTime;

        if (!searcher.timeout) {
            console.log('info depth ' + searcher.depth.toString() + ' score '
            + display_eval(evaluation) +' nodes ' +
            searcher.nodes.toString() + ' time ' + elapsed.toString() + ' nps '
            +((searcher.nodes / ((elapsed-old_elapsed) / 1000)) >> 0).toString()
            + ' pv ' + searcher.collect_PV());
        };
        if (searcher.timeout) {
            const PV = old_searcher.collect_PV(false);
            console.log('bestmove ' + str_move(PV[0]));
            return [PV, view * old_evaluation];
        }
        if ((elapsed >= time) || (curr_depth >= depth)) {
            const PV = searcher.collect_PV(false);
            console.log('bestmove ' + str_move(PV[0]));
            return [PV, view * evaluation];
        };

        old_searcher = searcher;
        old_evaluation = evaluation;
        old_elapsed = elapsed;
    };
};


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                    UCI                                     //
//                                                                            //
//                       The Universal Chess Interface                        //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
function isNumeric(num){
    return !isNaN(num);
};

function pretty_fen(fen) {
    var FEN = '';
    var Fen = fen;
    for (var i=0; i<7; i++) {
        Fen = Fen.replace('/', '');
    }
    for (var i of Fen.split(' ')[0]) {
        if (isNumeric(i)) {
            FEN += ' '.repeat(parseInt(i));
        } else {
            FEN += i;
        };
    };

    var board = ' +---+---+---+---+---+---+---+---+';
    var count = 0;
    for (var i=0; i<8; i++) {
        board += '\n';
        for (var j=0; j<8; j++) {
            board += ' | ' + FEN[count];
            count += 1;
        };
        board += ' | ' + (8-i).toString();
        board += '\n +---+---+---+---+---+---+---+---+';
    };
    board += '\n   a   b   c   d   e   f   g   h';
    board += '\n\nFen : ' + fen;

    return board;
};

var MoveOverhead = 10;

function manage(time, board, inc, movestogo) {
    // for time management
    /*
    return Math.min((2 - Math.min(board.move_stack.length, 10)) * 
           (time / Math.max(40 - board.move_stack.length, 1)) + inc, time);
    */
    if (movestogo == 0) {
        var Y = Math.max(10, 40 - board.move_stack.length/2);
        return time / Y + inc * Y/10 - MoveOverhead;
    };
    return time/movestogo + inc - MoveOverhead;
};

var board = new Board();

process.stdin.setEncoding('utf-8');
var readline = require('readline');
var UCI = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const fs = require('fs');

console.log('Réglisse-JS by Paul JF');
UCI.on('line', function(command){

    if (DEBUG) {
        fs.writeFile('./log.txt', command + '\n', { flag: 'a+' }, err => {});
    };

    if (command.split(' ')[0] == 'uci') {
        console.log('id name Réglisse-JS\nid author Paul JF\n');
        console.log('option name Clear Tables type button');
        console.log('option name Skill type spin default 20 min 0 max 20');
        console.log('option name Hash type spin default 128 min 4 max 256');
        console.log('option name Move Overhead type spin default 10 ' + 
                    'min 0 max 10000');
        // console.log('option name OwnBook type check default true');
        console.log('uciok');
    } else if (command.split(' ')[0] == 'quit') {
        process.exit();
    } else if (command.split(' ')[0] == 'ucinewgame') {
        board = new Board();
        reset_tables();
    } else if (command.split(' ')[0] == 'isready') {
        console.log('readyok')
    } else if (command.split(' ')[0] == 'eval') {
        var view = board.turn ? 1 : -1;
        console.log('Static eval : ' + evaluate(board).toString() * view +
                    ' cp');
    } else if (command.split(' ')[0] == 'd') {
        console.log(pretty_fen(board.fen));
        console.log('Key : ' + (hash(board)).toString(16).toUpperCase());
    } else if (command.split(' ')[0] == 'move') {
        var move = board.readMove(command.split(' ')[1]);
        if (board.genLegal().includes(move)) {
            board.push(move);
        };
    } else if (command.split(' ')[0] == 'undo') {
        if (board.move_stack.length >= 1) {
            board.pop(board.move_stack[board.move_stack.length - 1]);
        };
    } else if (command.split(' ')[0] == 'setoption' &&
               command.split(' ')[1] == 'name') {
        if (command.includes('Clear') && command.includes('Tables')) {
            reset_tables();
            console.log('info string Cleared Tables')
        };

        if (command.includes('Skill') && command.includes('value')) {
            SKILL = parseInt(
                command.split(' ')[command.split(' ').indexOf('value') + 1]);
            console.log('info string Skill set to ' + SKILL.toString());
            reset_tables();
        };

        if (command.includes('Hash') && command.includes('value')) {
            var HASH = parseInt(
                command.split(' ')[command.split(' ').indexOf('value') + 1]);
            setHashSize(HASH);
            console.log('info string TT size set to ' + ttSIZE.toString());
        };

        if (command.includes('Move Overhead') && command.includes('value')) {
            MoveOverhead = parseInt(
                command.split(' ')[command.split(' ').indexOf('value') + 1]);
            console.log('info string Move Overhead set to ' +
                         MoveOverhead.toString());
        };
    } else if (command.split(' ')[0] == 'go') {
        var depth = 3;
        var time  = false;
        var inc   = 0;
        var perft = false;
        var movestogo = 0;

        if (command.includes('movestogo')) {
            movestogo = parseInt(
                command.split(' ')[command.split(' ').indexOf('movestogo')+1]);
        };
        if (command.includes('perft')) {
            perft = parseInt(
                command.split(' ')[command.split(' ').indexOf('perft') + 1]);
        } else if (command.includes('depth')) {
            depth = parseInt(
                command.split(' ')[command.split(' ').indexOf('depth') + 1]);
        } else if (command.includes('movetime')) {
            time = parseInt(
                command.split(' ')[command.split(' ').indexOf('movetime') + 1])
                - MoveOverhead;
        } else if (board.turn) {
            if (command.includes('wtime')) {
                time = parseInt(
                   command.split(' ')[command.split(' ').indexOf('wtime') + 1]);
                if (command.includes('winc')) {
                    inc = parseInt(command.split(' ')
                        [command.split(' ').indexOf('winc') + 1]);
                };
                time = manage(time, board, inc, movestogo);
            };
        } else if (!board.turn) {
            if (command.includes('btime')) {
                time = parseInt(
                   command.split(' ')[command.split(' ').indexOf('btime') + 1]);
                if (command.includes('binc')) {
                    inc = parseInt(command.split(' ')
                        [command.split(' ').indexOf('binc') + 1]);
                };
                time = manage(time, board, inc, movestogo);
            };
        };
        if (perft) {
            PERFT(board, perft);    
        }
        else {
            console.log('info string searching for ' +
                (time >> 0).toString() + ' ms');
            var move = iterative_deepening(board, depth, time)[0][0];
            if (command.split(' ').includes('move')) {
                board.push(move);
            };
        };
    } else if (command.split(' ')[0] == 'position') {
        if (command.split(' ')[1] == 'startpos') {
            board = new Board();
        } else if (command.split(' ')[1] == 'fen') {
            if (command.includes('moves')) {
                board = new Board(
                    command.split(' ').slice(2, command.split(' ').
                    indexOf('moves')).join(' ')
                );
            } else {
                board = new Board(
                command.split(' ').slice(2, command.split(' ').length).join(' ')
                );
            };
        };

        if (command.includes('moves')) {
            for (var move of command.split(' ')
            .slice(
                command.split(' ').indexOf('moves')+1,
                command.split(' ').length)) {

                move = board.readMove(move);
                if (board.genLegal().includes(move)) {
                    board.push(move);
                } else {
                    break;
                };
            };
        };
    };
});