# Réglisse

Réglisse is a chess engine written from scratch in Python.\
Réglisse uses [mailbox](https://www.chessprogramming.org/Mailbox) and the idea behind it was simplicity and not playing strenght. I hope the code will be clear and well commented for them who want to understand how a chess engine works.


It currently has the following features :

- [Book](https://www.chessprogramming.org/Opening_Book) : [Stockfish](https://github.com/official-stockfish/Stockfish)['s openning book](https://github.com/official-stockfish/books)
- [Board representation](https://www.chessprogramming.org/Board_Representation)
    - [mailbox](https://www.chessprogramming.org/Mailbox)
    - [move encoding](https://www.chessprogramming.org/Encoding_Moves)
    - [piece coding](https://www.chessprogramming.org/Pieces)
- [Evaluation](https://www.chessprogramming.org/Evaluation)
    - [PSQT](https://www.chessprogramming.org/Piece-Square_Tables) eval
    - [material balance](https://www.chessprogramming.org/Material)
    - [tapered eval](https://www.chessprogramming.org/Tapered_Eval)
    - [space control eval](https://www.chessprogramming.org/Space)
    - [bishop pair](https://www.chessprogramming.org/Bishop_Pair)
- [Search](https://www.chessprogramming.org/Search)
    - [PVS](https://www.chessprogramming.org/Principal_Variation_Search)
    - [ZWS](https://www.chessprogramming.org/Principal_Variation_Search)
    - [PV](https://www.chessprogramming.org/Principal_Variation) store
        - [triangular PV-table](https://www.chessprogramming.org/Triangular_PV-Table)
    - [iterative deepening](https://www.chessprogramming.org/Iterative_Deepening)
    - [mate distance pruning](https://www.chessprogramming.org/Mate_Distance_Pruning)
    - [Quiescence Search](https://www.chessprogramming.org/Quiescence_Search)
        - [check extensions](https://www.chessprogramming.org/Check_Extensions) (check-evaders for the moment)
- [UCI](./engine-interface.md) interface (not fully supported)

## Why _Réglisse_ ?
Like for [Ramsès-Chess](https://github.com/PaulJeFi/ramses-chess), I took a cat name. Réglisse is one of my friend's cat.

## Special Thanks
See the [thanks file](./THANKS.md) to see people who made this project possible.

## LISENCE
See the [liscence file](./LICENSE.txt) to know more about legals stuffs.

## How to use
Réglisse supports some basics commands of the [UCI interface](./engine-interface.md). Three more commands exists :
   - ```move [move]``` : make the move (in UCI format) on the board
   - ```go move``` : make the engine search and play its move on the board
   - ```d``` : dysplays the [FEN](https://www.chessprogramming.org/Forsyth-Edwards_Notation) of the current position

To run the UCI interface, run the file [```uci.py```](./src/uci.py).

I think a good depth, between time and playing strength, is 3.