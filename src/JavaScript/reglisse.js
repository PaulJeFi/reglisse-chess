'use strict';
const DEBUG  = false;
const NAME   = 'Reglisse-JS';
const AUTHOR = 'Paul JF';
const ABOUT  = NAME + ' by ' + AUTHOR + ', see ' +
               'https://github.com/PaulJeFi/reglisse-chess';

const fs = require('fs');



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
    move |= to_;
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

function isNumeric(num){
    return !isNaN(num);
};

const countOccurrences = (arr, val)=>arr.reduce((a, v)=>(v===val ? a + 1: a),0);

// Sum of elements in array
const sum = (arr)=>arr.reduce((a, b) => a + b, 0);

function manhattanDistance(sq1, sq2) {
    
    var file1, file2, rank1, rank2;
    var rankDistance, fileDistance;
    file1 = sq1  & 7;
    file2 = sq2  & 7;
    rank1 = sq1 >> 3;
    rank2 = sq2 >> 3;
    rankDistance = Math.abs(rank2 - rank1);
    fileDistance = Math.abs(file2 - file1);
    //console.log((rankDistance+fileDistance))
    return rankDistance + fileDistance;
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
        this.startpos        = fen;

        fen = fen.split(' '); // So it will be easier do dissect it

        // Step 1 : initialize every flag that are not relative to piece
        // positions

        // 1.1 : turn
        if (fen[1] == 'w') {this.turn = true} else {this.turn = false};

        // 1.2 : castling rights
        this.castling_rights = [0];
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
        var mail_index = 21;
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
                this.board[mail_index] = WHITE | KING;
            } else if (fen[0][char] == 'Q') {
                this.board[mail_index] = WHITE | QUEEN;
            } else if (fen[0][char] == 'R') {
                this.board[mail_index] = WHITE | ROOK;
            } else if (fen[0][char] == 'B') {
                this.board[mail_index] = WHITE | BISHOP;
            } else if (fen[0][char] == 'N') {
                this.board[mail_index] = WHITE | KNIGHT;
            } else if (fen[0][char] == 'P') {
                this.board[mail_index] = WHITE | PAWN;
            } else if (fen[0][char] == 'k') {
                this.board[mail_index] = BLACK | KING;
            } else if (fen[0][char] == 'q') {
                this.board[mail_index] = BLACK | QUEEN;
            } else if (fen[0][char] == 'r') {
                this.board[mail_index] = BLACK | ROOK;
            } else if (fen[0][char] == 'b') {
                this.board[mail_index] = BLACK | BISHOP;
            } else if (fen[0][char] == 'n') {
                this.board[mail_index] = BLACK | KNIGHT;
            } else if (fen[0][char] == 'p') {
                this.board[mail_index] = BLACK | PAWN;
            };

            // Increment index if not at end of rank
            if (this.board[mail_index+1] != OFF_BOARD) {mail_index++};
        };
    };

    fen() {
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
            fen += 'K';
        };
        if (this.castling_rights[this.castling_rights.length -1] & 0b0010) {
            fen += 'Q';
        
        };
        if (this.castling_rights[this.castling_rights.length -1] & 0b0100) {
            fen += 'k';
        };
        if (this.castling_rights[this.castling_rights.length -1] & 0b1000) {
            fen += 'q';
        };
        if (!this.castling_rights[this.castling_rights.length -1]) {
            fen += '-';
        };

        // Step 2.3 : en-passant square
        if (SQUARE_NAMES[Math.abs(this.ep[this.ep.length -1])] == '') {
            fen += ' - '
        }
        else {fen +=' '+SQUARE_NAMES[Math.abs(this.ep[this.ep.length -1])]+' '};

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
                this.board[to_] = piece_color(piece) | promotion;
                this.board[from_] = EMPTY;
                this.ep.push(-1);
            }

            // 2 : double pawn push
            else if (Math.abs(from_ - to_) == 20) {
                this.board[to_] = piece;
                this.board[from_] = EMPTY;
                this.ep.push(((to_ + from_)/2) >> 0); // En-passant square
            }

            // 3 : en-passant
            else if (move >> 20) {
                this.ep.push(-1);

                if (from_ < to_) { // Black takes White
                    this.board[to_ - 10] = EMPTY;
                    this.board[to_] = piece;
                    this.board[from_] = EMPTY;
                }

                else { // White takes Black
                    this.board[to_ + 10] = EMPTY;
                    this.board[to_] = piece;
                    this.board[from_] = EMPTY;
                };
            }

            // 4 : Others pawn moves
            else {
                this.board[to_] = piece;
                this.board[from_] = EMPTY;
                this.ep.push(-1);
            };
        }

        // King moves
        else if (((piece ^ WHITE) == KING) || ((piece ^ BLACK) == KING)) {

            this.ep.push(-1);
            this.board[to_] = piece;
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
            this.board[to_] = piece;
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
            move_count++;   // already updated turn
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

    push_NONE() {

        // Flags update
        this.turn = !this.turn;
        this.move_stack.push(NONE);
    };

    pop_NONE() {

        // Update flags :
        this.turn = !this.turn;
        this.move_stack.pop();
    };

    attack(square, color) {
        // Determines if color attacks square. Used for example by legal moves
        // verifications

        var attacker = 0;

        // Attacked by Knight
        for (var offset of KNIGHT_VECTOR) {
            attacker = square + offset;
            if(this.board[attacker] == (color | KNIGHT)) {
                return true;
            };
        };

        // Attacked by King
        for (var offset of SLIDING_VECTORS[QUEEN]) {
            attacker = square + offset;
            if (this.board[attacker] == (color | KING)) {
                return true;
            };
        };

        // Attacked by Bishop or Queen
        for (var offset of BISHOP_VECTOR) { 
            for (var i=1; i<=8; i++) {
                attacker = square + offset * i;
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
                attacker = square + offset * i;
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
                    var opp = opp_color(color);

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
            var turn = this.turn ? WHITE : BLACK;
            this.push(move);
            if (!this.isCheck(turn)) {
                moves.push(move);
            };
            this.pop(move);
        };
        return moves;
    };

    readMove(move, quiet=false) {
        // Convert UCI move to encoded move (int)
        try {
            move = move.toLowerCase();
        } catch {
            return 0;
        };
        for (var Move of this.genLegal()) {
            if (str_move(Move) == move) {
                return Move;
            };
        };
        if (!quiet) {
            send_message('Illegal move : ' + move);
        };
        return 0;
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
            send_message(indent + str_move(move) + ' : ' + node.toString());
        };
        board.pop(move)
    };
    send_message('\n' + indent + 'Nodes searched : ' + nodes.toString());
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
var contempt = 0;

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

// mop-up evaluation
function mop_up(board) {
    
    var material = [0, 0]; // material score for [WHITE, BLACK]
    var side2move = board.turn ? 1 : -1;
    var score = 0;

    for (var sq=0; sq<64; sq++) {
        piece = board.board[mailbox64[sq]];
        if (piece != EMPTY) {
            material[piece_color(piece) >> 4] += eg_value[piece_type(piece)];
        };
    };

    var winner = 1; // WHITE 
    if (material[1] == material[0]) {
        return 0;
    } else if (material[1] > material[0]) {
        winner = -1; // BLACK
    };

    score += winner * (
        4.7 * CMD[board.board.indexOf(KING | (winner == 1 ? BLACK : WHITE))]
        + 1.6 * (14 - manhattanDistance(
        mailbox64.indexOf(mailbox[board.board.indexOf(KING | WHITE)]),
        mailbox64.indexOf(mailbox[board.board.indexOf(KING | BLACK)])
    )));

    return score * side2move;
};

function evaluate(board) {

    var late_eg_score = 0;
    // if no pawns are on the board, we are in late endgame
    if ((!board.board.includes(WHITE | PAWN)) &&
        (!board.board.includes(BLACK | PAWN))) {
        
        late_eg_score = mop_up(board);
    };

    var mg = [0, 0],
        eg = [0, 0],
        gamePhase = 0,
        piece = 0;

    for (var sq=0; sq<64; sq++) {
        piece = board.board[mailbox64[sq]];
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
    
    return (late_eg_score + ((mgScore * mgPhase + egScore * egPhase) / 24) + 
            (SKILL != 20 ? skill() : 0))>> 0;
};

// Add small random value to draw positions to add dynamism to the engine.
// Comtempt factor is seen as how happy would the engine been of drawing : quite
// happy against a stronger opponent (positive contempt), and quite unhappy
// against a weaker opponent (negative contempt). Note that is should be done
// for ealier draws, as avoiding late draws cans lead to a loss.
function value_draw(depth, nodes, board, player, ply) {
    return depth < 4 ? 0 : (2 * nodes % 2) - 1 -
            (board.turn == player ? contempt : -contempt)/(ply+1);
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
//                           TRANSPOSITION TABLE                              //
//                                                                            //
//            The transposition table (TT) is usefull when reaching           //
//                       already visited positions.                           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

/*
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
*/

init_zobrist();
var ttSIZE = 838860;  // The size of the transposition table (TT).

// Some hash flag used in TT :
const hashEXACT    = 0,
hashALPHA    = 1,
hashBETA     = 2,
valUNKNOW    = 1.5,   // impossible to have eval = 1.5 in practise
valInTT      = 2.5;   // impossible to have eval = 2.5 in practise

var tt    = []; // TT

class Entry {
    // A class that represents a TT entry.
    constructor() {
        this.key    = 0;
        this.depth  = 0;
        this.value  = 0;
        this.flag   = 0;
        this.move   = 0;
    };
};

function setHashSize(Mb) {
    // Set the hash size (thanks to WukongJS)

    // adjust MB if going beyond the aloowed bounds
    Mb = Math.max(4, Math.min(Mb, 256));
    
    ttSIZE = (Mb * 0x100000 / 20)>>0;
    reset_tables();
};

function score_to_tt(score, ply) {
    return  score >=   mateValue - 2 * MAX_PLY  ? score + ply
          : score <= -(mateValue - 2 * MAX_PLY) ? score - ply : score;
};

function score_from_tt(score, ply, rule50) {

    if (score >= mateValue - 2 * MAX_PLY) { // win
        if (score >= mateValue - MAX_PLY && mateValue - score > 99 - rule50)
            return mateValue - MAX_PLY - 1; // return only true mate score

        return score - ply;
    };

    if (score <= -(mateValue - 2 * MAX_PLY)) { // loss
        if (score <= -(mateValue - MAX_PLY) && mateValue + score > 99 - rule50)
            return -(mateValue - MAX_PLY) + 1; // return only true mate score

        return score + ply;
    };

    return score;
};

function ProbeHash(is_pv, depth, alpha, beta, hash_, ply, rule50) {
    // Probe the TT to extract information if it exists about a given position.

    var entry = tt[hash_ % ttSIZE];
    if (entry.key == hash_) {

        var value = score_from_tt(entry.value, ply, rule50);

        if (entry.depth >= depth && (depth <= 0 || !is_pv || !UCI_AnalyseMode)){

            // Table is exact or produces a cutoff
            if ( entry.flag == hashEXACT ||
                (entry.flag == hashALPHA) && (value <= alpha) ||
                (entry.flag == hashBETA)  && (value >= beta)) {
                return value;
            };

            // An entry with one depth lower can be accepted in some conditions.
            if (!is_pv && entry.depth >= depth - 1 && entry.flag == hashALPHA &&
                value + 128 <= alpha) {
                return alpha;
            };
        };

        return valInTT;
    };
    
    return valUNKNOW;
};

function RecordHash(depth, ply, val, flag, hash_, best_move=0, stop_search) {
    // Store information about the position in the TT.

    if (stop_search) {
        return;
    };

    // Replacement scheme
    var tt_entry = tt[hash_ % ttSIZE];
    if (flag != hashEXACT && hash_ == tt_entry.key
        && depth < tt_entry.depth - 2) {
        return;
    };
        
    var entry = new Entry();
    entry.key   = hash_;
    entry.value = score_to_tt(val, ply);
    entry.flag  = flag;
    entry.depth = depth;
    entry.move  = best_move;
    tt[hash_ % ttSIZE] = entry;
};



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                             MOVE ORDERING                                  //
//                                                                            //
//                Searching best moves first is faster than                   //
//                      searching them in random order.                       //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


var history_h = [], // History heuristic store
killers   = []; // Killer move store
const MAX_PLY      = 1024;  // ply are used in Killer Moves. See later.

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

reset_tables();

function history_new_iteration() {
    // Divide by 8 history heuristic, to not have a too big behaviour of history
    // on new search depth
    for (var i=0; i<2; i++) {
        history_h.push([]);
        for (var j=0; j<98+1; j++) {
            for (var k=0; k<98+1; k++) {
                history_h[i][j][k] = history_h[i][j][k] / 8;
            };
        };
    };
};

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

    
    // If we have no information about the quality of the move, we can try TT
    // score or evaluation to have an idea. This is not the best as it implies
    // to make and unmake the move. ~80 Elo
    /*
    if (score == 0) {
        var view = board.turn ? 1 : -1;
        board.push(move);
        score += ProbeHash(false, 0, -mateValue, mateValue, hash(board), 0, 0);
        // Note : TT probe can return valUNKNOW (1.5) or hash_NO_NULL (2.5), but
        // as theses moves are unknown or tactical, they could be interesting,
        // more than a classical drawing score. (At least it's my guess.)
        score += evaluate(board) * view;
        board.pop(move);
    };
    //*/


    return score;
};

function ordering(board, ply, moves, hash_=false, tt_move=NONE) {
    // A move ordering method. See score_move()
    var best_move = 0;
    if (hash_ && (tt_move == NONE)) {
        var entry = tt[hash_ % ttSIZE];
        if (entry.key == hash_) {
            best_move = entry.move;
        };
    } else if (tt_move != NONE) {
        best_move = tt_move;
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



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                 SEARCH                                     //
//                                                                            //
//         Search is the algorithm that try to find the best moves.           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// Some node information
const DO_NULL = 1,
NO_NULL = 0,
IS_PV   = 1,
NO_PV   = 0,

SORT_KILL = 80000000,
Q_PIECE_VALUE =  [EMPTY, 0, 980.5, 494.5, 331, 309, 88],
FUTILITY_MARGIN = [0, 200, 300, 500]; // for futility pruning

class Search {
    // The search class

    constructor(board, depth, time=Infinity) {
        this.board = board;
        this.depth = depth;
        this.nodes = 0;
        this.ply = board.move_stack.length;
        this.selfdepth = 0;
        this.player = this.board.turn; // to make the engine plays more or less
                                      // agressively with contempt

        var temp_board = new Board(board.startpos);
        this.hash = [hash(temp_board)]; // To detect draw by 3-fold repetition
        for (var move of board.move_stack) {
            temp_board.push(move);
            this.hash.push(hash(temp_board));
        };

        // Time management
        this.timeout        = false;
        this.startTime      = new Date().getTime();
        this.time_to_search = time;
    };

    pvSearch(depth, ply, alpha, beta, can_null, is_pv) {
        // Principal Variation Search
        
        this.selfdepth = Math.max(this.selfdepth, ply+1);
        var val = alpha-1;
        var bestmove;
        var tt_move = NONE;
        var tt_flag = hashALPHA;
        var flagInCheck;
        var legal_move = 0;      // number of legal moves in the position
        var raised_alpha = 0;
        var f_prune = 0;         // no futility pruning by default
        var reduction_depth = 0;
        var moves_tried = 0;     // number of moves tried
        var new_depth;

        // Search explosion check.
        if (ply >= MAX_PLY+1) {
            return evaluate(board);
        };

        // Time out checkup
        if ((this.nodes % 1024 == 0) || this.timeout) { // check timeout
                                                        // every 1024 nodes
            if ((new Date().getTime()) - this.startTime >= this.time_to_search){
                this.timeout = true;
                return 0;
            };
        };

        // Mate distance pruning
        // upper bound
        var mating_value = mateValue - ply;
        if (mating_value <= beta) {
            beta = mating_value;
            if (alpha >= mating_value) {
                return mating_value;
            };
        };
        // lower bound
        mating_value = mating_value = -mateValue + ply;
        if (mating_value >= alpha) {
            alpha = mating_value;
            if (beta <= mating_value) {
                return mating_value;
            };
        };

        if (alpha >= beta) {
            return alpha;
        };

        // Are we in ckeck ? If so, make a check-extension.
        var turn = this.board.turn ? WHITE : BLACK,
        flagInCheck = this.board.isCheck(turn);
        if (flagInCheck) {
            depth++;
        };
        
        this.nodes++;
        
        // Draw detection
        if (this.is_draw(NONE, ply)) {
            return value_draw(depth,this.nodes,this.board,this.player,ply) +ply;
        };
        
        // TT probe
        var hash_ = hash(this.board)
        val = ProbeHash(is_pv, depth, alpha, beta, hash_, ply,
                        this.board.rule_50);
        var inTT = false;
        if (val != valUNKNOW) {
            if (val != valInTT && !is_pv) {
                return val;
            };
            inTT = true;
        } else {
            val = alpha-1;
        };
        
        if (depth <= 0) {
            // if depth is lower than 0, just do a quiescence search
            return this.Quiescent(alpha, beta, ply);
        };

        // Eval pruning / Static null move pruning / Beta pruning /
        // Reverse futility pruning
        var static_eval = evaluate(this.board); // static eval of the board
        if (depth < 3 && (!is_pv) && (!flagInCheck) 
            && (Math.abs(beta - 1) > -mateValue + 100)) {
            var eval_margin = 120 * depth;
            if (static_eval - eval_margin >= beta) {
                return static_eval - eval_margin;
            };
        };

        // Alpha pruning
        if ((!is_pv) && !flagInCheck && depth <= 5 &&
            static_eval + 3000 <= alpha) {
                return static_eval;
        };

        // Razoring
        var value = beta;
        if (!is_pv && static_eval < alpha - 369 - 254 * depth * depth) {
            value = this.Quiescent(alpha-1, alpha, ply);
            if (value < alpha && !is_pv) {
                 return value;
            };
        };

        // Null move pruning
        if ((depth > 2) && (can_null) && (!is_pv) && (static_eval > beta)
            && (!flagInCheck)) {

            // Adaptative null move pruning
            var R = 2; // search reduction depth
            if (depth > 6) {
                R = 3;
            };

            board.push_NONE();
            val = -this.pvSearch(depth - R - 1, ply, -beta, -beta + 1,
                                                                NO_NULL, NO_PV);
            board.pop_NONE();

            if (val >= beta) {
                return beta;
            };
        };

        // Decide if we can apply futility pruning
        if (depth <= 3 && !is_pv && !flagInCheck && Math.abs(alpha) < 9000
            && static_eval + FUTILITY_MARGIN[depth] <= alpha) {
            f_prune = 1;
        };

        // extract TT move
        var entry = tt[hash_ % ttSIZE];
        if (entry.key == hash_) {
            tt_move = entry.move;
        };

        this.hash.push(hash_);
        var moves = ordering(this.board, ply, this.board.genPseudoLegalMoves(),
                             hash_, tt_move);
        bestmove = NONE;

        // Loop over the moves
        moove_loop: for (var move of moves) {

            this.board.push(move);

            if (this.board.isCheck(turn)) { // If the move is not a legal move
                this.board.pop(move);
                continue moove_loop;
            } else if (bestmove == NONE) { // if it's the first legal move we
                                           // are searching
                bestmove = move;
            };
            moves_tried++; // The move is a legal move

            if (ply == 0 && this.depth >= 5) { // Don't be too noisy !
                // UCI report of currmove at root
                send_message('info depth ' + this.depth.toString() +' currmove '
                + str_move(move) + ' currmovenumber ' + moves_tried.toString());
            };

            var other_king_in_check = !this.board.isCheck(opp_color(turn));

            // Futility pruning : at pre-fontier nodes (depth = 1), if the score
            // plus a bishop value is not better than alpha, simply return
            // alpha. The move has to not be a capture move or a promotion, or
            // leave the opponent in check.
            if (f_prune && legal_move && !(move & 0b0_1_111_111_0000000_0000000)
                && !other_king_in_check) {

                board.pop(move);
                continue moove_loop;
            };

            reduction_depth = 0;   // this move has not been reduced yet
            new_depth = depth - 1; // decrease depth by one ply

            // Late move reduction. With move ordering, latest moves are 
            // probably the worste. So decrease a little bit depth each time a
            // legal move is searched. We still need to exclude some moves 
            // (captures, promotions, checks, killer moves) from LMR.
            if (!is_pv && new_depth > 3  && legal_move && moves_tried > 3
                && !other_king_in_check && !flagInCheck
                && (killers[ply][0] != move) && (killers[ply][1] != move)
                && !(move & 0b0_1_111_111_0000000_0000000)) {

                reduction_depth = 1;
                if (moves_tried > 8) {
                    reduction_depth += 1;
                };
                new_depth -= reduction_depth;

            };

            // Test if this move made a draw by insufficient material.
            // If the move is a capture.
            if (move & (0b111 << 17)) { // ep = at least 1 pawn left -> not draw
                if (this.is_draw(move, ply+1)) { // ply+1 since we made the move
                    this.board.pop(move);
                    if (alpha < 0) {
                        bestmove = move;
                        alpha = value_draw(depth, this.nodes, this.board,
                                           this.player, ply) + ply + 1;
                        if (alpha > beta) {
                            alpha = beta;
                            break moove_loop;
                        };
                    };
                    continue moove_loop;
                };
            };

          // PV-search
          re_search : while (true) {

            if (!raised_alpha) {
                val = -this.pvSearch(new_depth, ply + 1, -beta, -alpha, DO_NULL,
                                    is_pv);
            } else {
                // If we found the PV, no need to do a full-window search
                // first try to refute a move - if this fails, do a real search
                if (-this.pvSearch(new_depth, ply + 1, -alpha - 1, -alpha,
                                DO_NULL, NO_PV) > alpha) {
                    val = -this.pvSearch(new_depth, ply + 1, -beta, -alpha,
                                        DO_NULL, IS_PV);
                };
            };

            
            // When reduced search finds val > alpha, we make a full window
            // search.
            if (reduction_depth && val > alpha) {
                new_depth += reduction_depth;
                reduction_depth = 0;
                continue re_search;
            };

            this.board.pop(move);
            legal_move++; // updated here, because we want to make one search
                          // before skipping moves

            // If we can improve alpha, the move searched is the best move found
            // so far.
            if (val > alpha) {

                bestmove = move;

                if (val >= beta) { // beta cutoff

                    // Update killer and history tables.
                    if (!(move & 0b0_1_111_000_0000000_0000000)) {
                    
                        // If the move is not a capture move, let's update 
                        // history heuristics. The idea is that if this move is
                        // the best on this position, it could also be the best
                        // on others positions, and searching bests moves first
                        // saves time in search.
                        history_h[this.board.turn >> 0]
                                [(move & 0b0_1111111_0000000) >> 7]
                                [move & 0b0_1111111] += depth ** 2;

                        if (killers[ply][0] != move) {
                            // If the move is not a capture one, let's store it
                            // as a killer move. The idea is that if this move
                            // create a beta cutoff now, it can also create a
                            // beta cutoff on other positions, so we could
                            // search this move first to create beta cutoffs
                            // and save time.
                            killers[ply][1] = killers[ply][0];
                            killers[ply][0] = move;
                        };

                        // Sometimes, history table can overflow. Rare.
                        if (history_h[this.board.turn >> 0]
                            [(move & 0b0_1111111_0000000) >> 7]
                            [move & 0b0_1111111] > SORT_KILL) {

                            send_message('info string HISTORY OVERFLOW');

                            for (var i=0; i<2; i++) {
                                for (var j=0; j<98+1; j++) {
                                    for (var k=0; k<98+1; k++) {
                                        history_h[i][j][k] = 
                                                        history_h[i][j][k] / 2;
                                    };
                                };
                            };
                        };
                    };

                    tt_flag = hashBETA;
                    alpha = beta;
                    break moove_loop; // no need to search on this position
                                      // anymore
                };

                raised_alpha = 1;
                tt_flag = hashEXACT;
                alpha = val;
            }; // enf if val > alpha

            break re_search;
          }; // end re_search
        }; // end moves loop

        // Checkmate and stalemate detection
        if (!legal_move) {
            bestmove = NONE;

            if (flagInCheck) { // mate
                alpha = -mateValue + ply;
            } else { // draw
                alpha = value_draw(depth, this.nodes, this.board,
                                   this.player, ply) + ply;
            };
        };

        this.hash.pop();
        // store in TT
        RecordHash(depth, ply, alpha, tt_flag, hash_, bestmove, this.timeout);
        return alpha;
    };

    Quiescent(alpha, beta, ply) {
        // Quiescence search : when search reaches its depth limit, we need to
        // be sure to not miss tactics before calling evaluation.

        this.selfdepth = Math.max(this.selfdepth, ply+1);

        var turn = this.board.turn ? WHITE : BLACK;
        this.nodes++;

        // Search explosion check.
        if (ply >= MAX_PLY+1) {
            return evaluate(board);
        };
        
        // Time out checkup
        if ((this.nodes % 1024 == 0) || this.timeout) { // check timeout
                                                             // every 1024 nodes
            if ((new Date().getTime()) - this.startTime >= this.time_to_search){
                this.timeout = true;
                return 0;
            };
        };

        // stand pat pruning
        var val = evaluate(this.board);
        var stand_pat = val;

        // check if stand-pat score causes a beta cutoff
        if (val >= beta) {
            return beta;
        };
        
        // check if stand-pat inceases alpha
        if (val > alpha) {
            alpha = val;
        };

        for (var move of ordering(this.board, ply,
            this.board.genPseudoLegalCaptures())) {

            this.board.push(move);

            if (this.board.isCheck(turn)) { // if the move is not a legal one
                this.board.pop(move);
                continue;
            };

            // Delta cutoff
            var captured_value = 0;
            if (move & move & 0b0_1_000_000_0000000_0000000) { // ep
                captured_value = Q_PIECE_VALUE[PAWN];
            } else {
                captured_value = Q_PIECE_VALUE[
                                  (move & 0b0_111_000_0000000_0000000) >> 17];
            };
            if ((stand_pat + captured_value + 200 < alpha) &&
               !(move & 0b0_111_0000000_0000000)) {
                this.board.pop(move);
                continue;
            };

            // Delta pruning
            var BIG_DELTA = 975; // queen value
            if (move & 0b0_111_0000000_0000000) {
                BIG_DELTA += 775;
            };

            if (val < alpha - BIG_DELTA)  {
                this.board.pop(move);
                return alpha;
            };

            // Bad captures (not exactly SEE)
            if (this.badCapture(move) && !(move & 0b0_111_0000000_0000000)) {
                this.board.pop(move);
                continue;
            };

            // Test if this move made a draw by insufficient material.
            if (move & (0b111 << 17)) { // ep = at least 1 pawn left -> not draw
                if (this.is_draw(move, 1)) {
                    this.board.pop(move);
                    if (alpha < 0) {
                        alpha = value_draw(this.depth + ply, this.nodes,
                                           this.board, this.player, ply) +ply+1;
                        if (alpha > beta) {
                            alpha = beta;
                            break;
                        };
                    };
                    continue;
                };
            };

    
            val = -this.Quiescent(-beta, -alpha, ply+1);
            this.board.pop(move);

            if (val > alpha) {
                if (val >= beta) {
                    return beta;
                };
                alpha = val;
            };
        };

        return alpha;
    };

    badCapture(move) {

        var capturing_piece = piece_type(this.board.board[move & 0b0_1111111]);
        // captures by pawns do not lose material
        if (capturing_piece == PAWN) {
            return false;
        };

        var captured_piece = (move & (0b0_111 << 17)) >> 17;
        // captures "lower takes higher" are good by definition
        if (Q_PIECE_VALUE[captured_piece] >= 
            Q_PIECE_VALUE[capturing_piece] - 50) {
            return false;
        };

        if (this.pawnRecapture(move & 0b0_1111111) &&
            (Q_PIECE_VALUE[captured_piece] + 200
            - Q_PIECE_VALUE[capturing_piece] < 0)) {
            return true;
        };

        // Else, we don't know. We have to try it !
        return false;
    };

    pawnRecapture(square) {
        
        if (this.badCapture.turn) { // White recaptures
            if ((this.board.board[square + 11] == (WHITE | PAWN)) ||
                (this.board.board[square +  9] == (WHITE | PAWN))) {
                return true;
            };
        } else { // black recaptures
            if ((this.board.board[square - 11] == (BLACK | PAWN)) ||
                (this.board.board[square -  9] == (BLACK | PAWN))) {
                return true;
            };
        };

        return false;
    };

    collect_PV(str=true) {
        // Return the PV in the str or move format, by looking in the TT.
        // Note : TT overflow or replacement sheme can break the PV.
        var line = '',
            PV   = [],
            move = 0,
            temp_board = new Board(this.board.fen()),
            hash_list = [],
            entry;

        while (true) {
            entry = tt[hash(temp_board) % ttSIZE];
            if (entry.key == hash(temp_board)) {
                move = entry.move;
            } else { // the entry do not contains the position
                break;
            };

            if (move == 0) { // there is no move stored
                break;
            };

            if (move != temp_board.readMove(str_move(move), true)) {
                // the move stored is illegal in this position
                break;
            };

            // Else : we have a PV-move !
            temp_board.push(move);
            line += str_move(move) + ' ';
            PV.push(move);
            hash_list.push(hash(temp_board));

            if (countOccurrences(hash_list, hash(temp_board)) >= 3) {
                break;
            };
        };

        if (str) {
            return line;
        };
        return PV;
    };

    is_draw(move, ply) {
        if (this.board.rule_50 >= 50 || 
            countOccurrences(this.hash, this.hash[this.ply + ply - 1]) >= 3) {
            return true;
        };
        if (move) {
            var piece_count = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
            var piece = EMPTY;
            for (var square of mailbox64) {
                piece = this.board.board[square];
                if (piece != EMPTY) {
                    piece_count[piece_color(piece) >> 4][piece_type(piece)]++;
                };
            };
            if (sum(piece_count[0]) + sum(piece_count[1]) <= 2) { // lone kings
                return true;
            };
            // TODO : draw material like KB vs K
        };
        return false;
    };

};

function display_eval(evaluation) {
    if (( evaluation >= mateValue - MAX_PLY) ||
        (-evaluation >= mateValue - MAX_PLY)) {
            return 'mate ' + ((evaluation >= 0 ? 1 : -1) * Math.ceil((mateValue
                - Math.abs(evaluation))/2)).toString();
        };
    return 'cp ' + evaluation.toString();
};

function hashfull() {
    // Estimates hashfull over 1000 hash entry
    if (showHashFull) {
        var counter = 1000;
        for (var i = 0; i < 1000; i++) {
            var entry = tt[i % ttSIZE];
            if (entry.key == 0 && entry.depth == 0
                && entry.value == 0 && entry.flag == 0 && entry.move == 0) {
                counter--;
            };
        };
        return ' hashfull ' + (counter).toString();
    };
    return '';
};


// The win rate model returns the probability (per mille) of winning given an
// eval and a game-ply. The model is taken from Stockfish 15 (file uci.cpp).
function win_rate_model(v, ply) {

    // The model captures only up to 240 plies, so limit input (and rescale)
    var m = Math.min(240, ply) / 64.0;

    // Coefficients of a 3rd order polynomial fit based on fishtest data
    // for two parameters needed to transform eval to the argument of a
    // logistic function.
    var as = [-1.17202460e-01, 5.94729104e-01, 1.12065546e+01, 1.22606222e+02];
    var bs = [-1.79066759,  11.30759193, -17.43677612,  36.47147479];
    var a = (((as[0] * m + as[1]) * m + as[2]) * m) + as[3];
    var b = (((bs[0] * m + bs[1]) * m + bs[2]) * m) + bs[3];

    // Transform eval to centipawns with limited range
    var x = Math.min(Math.max((100 * v) / eg_value[eg_value.length - 1],
                              -2000.0), 2000.0);

    // Return win rate in per mille (rounded to nearest)
    return (0.5 + 1000 / (1 + Math.exp((a - x) / b))) >> 0;
};

// wdl() report WDL statistics given an evaluation and a game ply, based on
// Stockfish 15 model (file uci.cpp).

function wdl(v, ply) {

    var wdl_w = win_rate_model( v, ply);
    var wdl_l = win_rate_model(-v, ply);
    var wdl_d = 1000 - wdl_w - wdl_l;
    return [wdl_w, wdl_d, wdl_l];
};

function exponentialRegression(x, y) {
    let n = x.length;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let sxy = 0;
    let syy = 0;
  
    for (let i = 0; i < n; i++) {
      sx += x[i];
      sy += Math.log(y[i]);
      sxx += x[i] * x[i];
      sxy += x[i] * Math.log(y[i]);
      syy += Math.log(y[i]) * Math.log(y[i]);
    };
  
    let delta = n * sxx - sx * sx;
    let b = (n * sxy - sx * sy) / delta;
    let a = (sxx * sy - sx * sxy) / delta;
    // let r2 = Math.pow((n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) *
    // (n * syy - sy * sy)), 2);
    // We do not need to compute r2 for a chess engine !
  
    return [Math.exp(a), b]; //, r2];
    // y = a * exp(b * x)
};

// This is an exponential model of how we can predict the number of nodes in the
// next iteration knowing the previous ones. It is useful while the engine is
// playing. It is better to not start a new iteration if we know it will be
// arrested by timeouted, as it can save time for the rest of the game.
function model_nodes_times(y, speed, time, playing) {

    // x : depth
    // y : nodes
    var n = y.length

    if ((n < 5) || !playing) {
        return false; // assume depth 5 is fast to reach
    };

    var x = [];
    for (var i=1; i<=n; i++) {
        x.push(i);
    };

    let [a, b] = exponentialRegression(x, y);
    
    // Predicts nuber of nodes in the next iteration
    var next_nodes = a * Math.exp(b * (n+1));

    if (time - next_nodes/speed <= 0) {
        return true; // we have made the estimation that a new search would take
                     // too much time
    };
    return false;
};

function iterative_deepening(board, depth=5, time=false, playing=false) {

    if (!UCI_AnalyseMode) {
        var moves = board.genLegal();
        if (moves.length == 1) {
            send_message('bestmove ' + str_move(moves[0]));
            return [moves[0], valUNKNOW];
        };
    }; 

    var startTime = new Date().getTime();
    var searcher = 0;
    var old_searcher = 0;
    var complexity = 0;
    var evaluation = 0;
    var old_evaluation = 0;
    var elapsed = 0;
    var view = board.turn ? 1 : -1;
    var WDL = '';
    var WDL_v = [0, 0, 0];
    var old_nodes = 1;
    var nodes = 0;
    var nodes_history = [];
    var PV = [];
    var old_PV = [];

    if (time) {
        depth = MAX_PLY;
    } else {
        time = Infinity;
    };
    
    for (var curr_depth=1; curr_depth<=depth; curr_depth++) {

        history_new_iteration();
        searcher = new Search(board, curr_depth, time - elapsed);
        evaluation = searcher.pvSearch(searcher.depth, 0, -mateValue, mateValue,
                                       NO_NULL, IS_PV);
        elapsed = (new Date().getTime()) - startTime;
        PV = searcher.collect_PV(false);

        if (!searcher.timeout) {
            nodes = searcher.nodes;
            nodes_history.push(nodes);
            WDL = '';
            if (UCI_ShowWDL) {
                WDL_v = wdl(evaluation, board.move_stack.length);
                WDL = ' wdl ' + WDL_v[0].toString() + ' ' + WDL_v[1].toString()
                      + ' ' + WDL_v[2].toString();
            }
            send_message('info depth ' + searcher.depth.toString() +
            ' seldepth ' + searcher.selfdepth.toString() + ' score '
            + display_eval(evaluation) + WDL +' nodes ' +
            nodes + ' nps ' 
            + ((nodes / (elapsed / 1000)) >> 0).toString() + ' time ' +
            elapsed.toString() + hashfull() + (showEBF ? ' ebf ' +
            Math.round(nodes/old_nodes) : '') + ' pv ' + searcher.collect_PV());
            
            if ((depth > 2) && (PV[0] != old_PV[0])) {
                complexity += (curr_depth-1) *
                             Math.abs(old_evaluation - evaluation) / curr_depth;
            };

            send_message('info string complexity ' + Math.round(complexity));
        };
        if (searcher.timeout) {
            PV = old_PV;
            send_message('bestmove ' + str_move(PV[0]));
            return [PV, view * old_evaluation];
        }
        if ((elapsed >= time) || (curr_depth >= depth) || model_nodes_times(
            nodes_history, nodes/elapsed, time-elapsed, playing)) {
            send_message('bestmove ' + str_move(PV[0]));
            return [PV, view * evaluation];
        };

        old_searcher = searcher;
        old_evaluation = evaluation;
        old_PV = PV;
        old_nodes = nodes;
    };
};


////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                   BOOK                                     //
//                                                                            //
//                         The book reader interface                          //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


const DEFAULT_BOOK = 'TSCP_book.txt';
var bookFile = DEFAULT_BOOK;

class Book {
    // The Book class
    constructor(book_file) {
        this.load(book_file);
    };

    load(book_file) {
        var lines = []; // the book list, containing UCI lines
        this.book  = {}; // the book, used by hash -> moves
        var board = new Board();
        var hash_ = 0;
        try {
            lines = fs.readFileSync(book_file).toString().split('\n');
            for (var line of lines) {
                board = new Board();
                for (var move of line.split(' ')) {
                    hash_ = hash(board)
                    if (this.book.hasOwnProperty(hash_)) {
                        this.book[hash_] = [move.replace(/(\r\n|\n|\r)/gm, "")]
                        .concat(this.book[hash_]);
                    } else {
                        this.book[hash_] = move.replace(/(\r\n|\n|\r)/gm, "");
                    };
                    board.push(board.readMove(
                        move.replace(/(\r\n|\n|\r)/gm, ""), true));
                };
            };
            
        } catch (error) {
           send_message('info string opening book ' + book_file +' not found');
        }; 
    };

    move_from_book(board) {

        if (board.startpos != STARTING_FEN) {
            return '0000';
        };
        var hash_ = hash(board);
        var options = [];
        
        if (this.book.hasOwnProperty(hash_)) {
            options = this.book[hash_];
        };
        
        if (options.length) {
            return options[Math.floor(Math.random() * options.length)]
        };

        return '0000';
    };
};

var book = new Book(bookFile);



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                   BENCH                                    //
//                                                                            //
//                                Testing code                                //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


// testing positions taken from Stockfish 15.1 (file benchmark.cpp)
const benchlist = [
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 10',
  '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 11',
  '4rrk1/pp1n3p/3q2pQ/2p1pb2/2PP4/2P3N1/P2B2PP/4RRK1 b - - 7 19',
  'rq3rk1/ppp2ppp/1bnpb3/3N2B1/3NP3/7P/PPPQ1PP1/2KR3R w - - 7 14 moves d4e6',
  'r1bq1r1k/1pp1n1pp/1p1p4/4p2Q/4Pp2/1BNP4/PPP2PPP/3R1RK1 w - - 2 14 moves' +
  ' g2g4',
  'r3r1k1/2p2ppp/p1p1bn2/8/1q2P3/2NPQN2/PPP3PP/R4RK1 b - - 2 15',
  'r1bbk1nr/pp3p1p/2n5/1N4p1/2Np1B2/8/PPP2PPP/2KR1B1R w kq - 0 13',
  'r1bq1rk1/ppp1nppp/4n3/3p3Q/3P4/1BP1B3/PP1N2PP/R4RK1 w - - 1 16',
  '4r1k1/r1q2ppp/ppp2n2/4P3/5Rb1/1N1BQ3/PPP3PP/R5K1 w - - 1 17',
  '2rqkb1r/ppp2p2/2npb1p1/1N1Nn2p/2P1PP2/8/PP2B1PP/R1BQK2R b KQ - 0 11',
  'r1bq1r1k/b1p1npp1/p2p3p/1p6/3PP3/1B2NN2/PP3PPP/R2Q1RK1 w - - 1 16',
  '3r1rk1/p5pp/bpp1pp2/8/q1PP1P2/b3P3/P2NQRPP/1R2B1K1 b - - 6 22',
  'r1q2rk1/2p1bppp/2Pp4/p6b/Q1PNp3/4B3/PP1R1PPP/2K4R w - - 2 18',
  '4k2r/1pb2ppp/1p2p3/1R1p4/3P4/2r1PN2/P4PPP/1R4K1 b - - 3 22',
  '3q2k1/pb3p1p/4pbp1/2r5/PpN2N2/1P2P2P/5PP1/Q2R2K1 b - - 4 26',
  '6k1/6p1/6Pp/ppp5/3pn2P/1P3K2/1PP2P2/3N4 b - - 0 1',
  '3b4/5kp1/1p1p1p1p/pP1PpP1P/P1P1P3/3KN3/8/8 w - - 0 1',
  '2K5/p7/7P/5pR1/8/5k2/r7/8 w - - 0 1 moves g5g6 f3e3 g6g5 e3f3',
  '8/6pk/1p6/8/PP3p1p/5P2/4KP1q/3Q4 w - - 0 1',
  '7k/3p2pp/4q3/8/4Q3/5Kp1/P6b/8 w - - 0 1',
  '8/2p5/8/2kPKp1p/2p4P/2P5/3P4/8 w - - 0 1',
  '8/1p3pp1/7p/5P1P/2k3P1/8/2K2P2/8 w - - 0 1',
  '8/pp2r1k1/2p1p3/3pP2p/1P1P1P1P/P5KR/8/8 w - - 0 1',
  '8/3p4/p1bk3p/Pp6/1Kp1PpPp/2P2P1P/2P5/5B2 b - - 0 1',
  '5k2/7R/4P2p/5K2/p1r2P1p/8/8/8 b - - 0 1',
  '6k1/6p1/P6p/r1N5/5p2/7P/1b3PP1/4R1K1 w - - 0 1',
  '1r3k2/4q3/2Pp3b/3Bp3/2Q2p2/1p1P2P1/1P2KP2/3N4 w - - 0 1',
  '6k1/4pp1p/3p2p1/P1pPb3/R7/1r2P1PP/3B1P2/6K1 w - - 0 1',
  '8/3p3B/5p2/5P2/p7/PP5b/k7/6K1 w - - 0 1',
  '5rk1/q6p/2p3bR/1pPp1rP1/1P1Pp3/P3B1Q1/1K3P2/R7 w - - 93 90',
  '4rrk1/1p1nq3/p7/2p1P1pp/3P2bp/3Q1Bn1/PPPB4/1K2R1NR w - - 40 21',
  'r3k2r/3nnpbp/q2pp1p1/p7/Pp1PPPP1/4BNN1/1P5P/R2Q1RK1 w kq - 0 16',
  '3Qb1k1/1r2ppb1/pN1n2q1/Pp1Pp1Pr/4P2p/4BP2/4B1R1/1R5K b - - 11 40',
  '4k3/3q1r2/1N2r1b1/3ppN2/2nPP3/1B1R2n1/2R1Q3/3K4 w - - 5 1',
];

function bench() {
    for (var com of benchlist) {
        read_command('ucinewgame');
        read_command('position fen ' + com);
        read_command('d');
        read_command('go movetime 500');
        read_command('ucinewgame');
    };
};



////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                                    UCI                                     //
//                                                                            //
//                       The Universal Chess Interface                        //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


var MoveOverhead    = 10;
var UCI_AnalyseMode = false;
var UseBook         = true;
var showHashFull    = false;
var infiniteDepth   = 5;
var UCI_ShowWDL     = false;
var showEBF         = false;

function send_message(message) {
    if (DEBUG) {
        fs.writeFile('./log.txt', message + '\n', { flag: 'a+' }, err => {});
    };
    console.log(message);
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

function manage(time, board, inc, movestogo) {
    // for time management
    /*
    return Math.min((2 - Math.min(board.move_stack.length, 10)) * 
           (time / Math.max(40 - board.move_stack.length, 1)) + inc, time);
    */
    if (movestogo == 0) {
        var Y = Math.max(10, 40 - board.move_stack.length/2);
        return Math.max(0, Math.min(time - MoveOverhead,
                        time / Y + inc * Y/10 - MoveOverhead));
    };
    return Math.max(0, Math.min(time - MoveOverhead,
                    time/movestogo + inc - MoveOverhead));
};  

var board = new Board();

process.stdin.setEncoding('utf-8');
var readline = require('readline');
var UCI = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

send_message(NAME + ' by ' + AUTHOR);
UCI.on('line', function(command){
    read_command(command);
});

function read_command(command) {
    if (DEBUG) {
        fs.writeFile('./log.txt', command + '\n', { flag: 'a+' }, err => {});
    };

    if (command.split(' ')[0] == 'uci') {
        send_message('id name ' + NAME + '\nid author ' + AUTHOR + '\n');
        send_message('option name UCI_EngineAbout type string default '+ABOUT);
        send_message('option name Clear Tables type button');
        send_message('option name Skill type spin default 20 min 0 max 20');
        send_message('option name Hash type spin default 128 min 4 max 256');
        send_message('option name Move Overhead type spin default 10 ' + 
                    'min 0 max 10000');
        send_message('option name UCI_AnalyseMode type check default false');
        send_message('option name UCI_ShowWDL type check default false');
        send_message('option name UseBook type check default true');
        send_message('option name Book File type string default '+DEFAULT_BOOK);
        send_message('option name Show HashFull type check default false');
        send_message('option name Depth Infinite type spin default 5 min 1 ' + 
                    'max 30');
        send_message('option name Contempt type spin default 0 min -250 max' +
                    ' 250');
        send_message('option name ShowEBF type check default false');
        send_message('uciok');
    } else if (command.split(' ')[0] == 'quit') {
        process.exit();
    } else if (command.split(' ')[0] == 'ucinewgame') {
        board = new Board();
        reset_tables();
    } else if (command.split(' ')[0] == 'isready') {
        send_message('readyok')
    } else if (command.split(' ')[0] == 'eval') {
        var view = board.turn ? 1 : -1;
        send_message('Static eval : ' + evaluate(board).toString() * view +
                    ' cp');
    } else if (command.split(' ')[0] == 'd') {
        send_message(pretty_fen(board.fen()));
        send_message('Key : ' + (hash(board)).toString(16).toUpperCase());
    } else if (command.split(' ')[0] == 'move') {
        var move = board.readMove(command.split(' ')[1]);
        if (move != 0) {
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
            send_message('info string Cleared Tables')
        };

        if (command.includes('Skill') && command.includes('value')) {
            SKILL = parseInt(
                command.split(' ')[command.split(' ').indexOf('value') + 1]);
            send_message('info string Skill set to ' + SKILL.toString());
            reset_tables();
        };

        if (command.includes('Hash') && command.includes('value') &&
        !command.includes('HashFull')) {
            var HASH = parseInt(
                command.split(' ')[command.split(' ').indexOf('value') + 1]);
            setHashSize(HASH);
            send_message('info string TT size set to ' + ttSIZE.toString());
        };

        if (command.includes('Move Overhead') && command.includes('value')) {
            MoveOverhead = parseInt(
                command.split(' ')[command.split(' ').indexOf('value') + 1]);
            send_message('info string Move Overhead set to ' +
                        MoveOverhead.toString());
        };

        if (command.includes('UCI_AnalyseMode') && command.includes('value')) {
            UCI_AnalyseMode = (
                command.split(' ')[command.split(' ').indexOf('value') + 1]
                == 'true');
            send_message('info string UCI_AnalyseMode set to ' +
                        UCI_AnalyseMode.toString());
        };

        if (command.includes('UCI_ShowWDL') && command.includes('value')) {
            UCI_ShowWDL = (
                command.split(' ')[command.split(' ').indexOf('value') + 1]
                == 'true');
            send_message('info string UCI_ShowWDL set to ' +
                        UCI_ShowWDL.toString());
        };

        if (command.includes('UseBook') && command.includes('value')) {
            UseBook = (
                command.split(' ')[command.split(' ').indexOf('value') + 1]
                == 'true');
            send_message('info string UseBook set to ' +
                        UseBook.toString());
        };

        if (command.includes('Book File') && command.includes('value')) {
            bookFile = 
                    command.split(' ')[command.split(' ').indexOf('value') + 1];
            send_message('info string Book File set to ' +
                        bookFile);
            book = new Book(bookFile);
        };

        if (command.includes('Show HashFull') && command.includes('value')) {
            showHashFull = (
                command.split(' ')[command.split(' ').indexOf('value') + 1]
                == 'true');
            send_message('info string Show HashFull set to ' +
                        showHashFull.toString());
        };

        if (command.includes('Depth Infinite') && command.includes('value')) {
            infiniteDepth = parseInt(
                command.split(' ')[command.split(' ').indexOf('value') + 1]);
            send_message('info string Depth Infinite set to ' +
                        infiniteDepth.toString());
        };

        if (command.includes('Contempt') && command.includes('value')) {
            contempt = parseInt(
                command.split(' ')[command.split(' ').indexOf('value') + 1]);
            send_message('info string Contempt set to ' +
                        contempt.toString());
        };

        if (command.includes('ShowEBF') && command.includes('value')) {
            showEBF = (
                command.split(' ')[command.split(' ').indexOf('value') + 1]
                == 'true');
            send_message('info string ShowEBF set to ' +
                        showEBF.toString());
        };

    } else if (command.split(' ')[0] == 'go') {
        var depth = infiniteDepth;
        var time  = false;
        var inc   = 0;
        var perft = command.includes('perft');
        var movestogo = 0;
        var let_search = true;
        var playing = false; // if a playing time is specified, the engine can
                             // behave differently

        if (UseBook && !perft) {
            move = book.move_from_book(board);
            move = board.readMove(move, true);
            if (move != 0) {
                if (command.split(' ').includes('move')) {
                    board.push(move);
                };

                // because for some reasons fast-chess bugs ...
                send_message('info depth 10 score cp 0 pv ' + str_move(move));
                send_message('bestmove ' + str_move(move));
                let_search = false;
            };
        };

        if (command.includes('movestogo')) {
            movestogo = parseInt(
                command.split(' ')[command.split(' ').indexOf('movestogo')+1]);
        };
        if (perft) {
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
                playing = true;
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
                playing = true;
            };
        };
        if (perft) {
            PERFT(board, perft);    
        } else if (!let_search) {}
        else {
            send_message('info string searching for ' +
                (time >> 0).toString() + ' ms at depth ' + depth.toString());
            var move = iterative_deepening(board, depth, time, playing)[0][0];
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
                if (move != 0) {
                    board.push(move);
                } else {
                    break;
                };
            };
        };
    } else if (command.split(' ')[0] == 'bench') {
        bench();
    };
};