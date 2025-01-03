# Réglisse

<img src="./logo/logo.svg" width="300" height="300">

Réglisse is a chess engine written from scratch in Python and JavaScript.\
Réglisse uses [mailbox](https://www.chessprogramming.org/Mailbox) and the idea behind it was simplicity and not playing strenght. I hope the code will be clear and well commented for those who want to understand how a chess engine works.


It currently has the following features :

- [Book](https://www.chessprogramming.org/Opening_Book) : [Stockfish](https://github.com/official-stockfish/Stockfish)['s opening book](https://github.com/official-stockfish/books) _to be added on JS version_
- [Board representation](https://www.chessprogramming.org/Board_Representation)
    - [mailbox](https://www.chessprogramming.org/Mailbox)
    - [move encoding](https://www.chessprogramming.org/Encoding_Moves)
    - [piece coding](https://www.chessprogramming.org/Pieces)
- [Evaluation](https://www.chessprogramming.org/Evaluation)
    - [PSQT](https://www.chessprogramming.org/Piece-Square_Tables) eval
    - [material balance](https://www.chessprogramming.org/Material)
    - [tapered eval](https://www.chessprogramming.org/Tapered_Eval)
    - [Mop-up evaluation](https://www.chessprogramming.org/Mop-up_Evaluation)
    - [Trapped bisops](https://www.chessprogramming.org/Trapped_Pieces)
    - [Minor pieces development](https://www.chessprogramming.org/Development)
    - [Center control](https://www.chessprogramming.org/Center_Control) : [Pawn center](https://www.chessprogramming.org/Pawn_Center)
    - [Unadvanced central pawns](https://www.chessprogramming.org/Development#Eval_Considerations)
    - [space control eval](https://www.chessprogramming.org/Space) _to be readded_
    - [bishop pair](https://www.chessprogramming.org/Bishop_Pair) _to be readded_
- [Search](https://www.chessprogramming.org/Search)
    - [PVS](https://www.chessprogramming.org/Principal_Variation_Search)
    - [ZWS](https://www.chessprogramming.org/Principal_Variation_Search)(in PVS)
    - [PV](https://www.chessprogramming.org/Principal_Variation) store
        - [triangular PV-table](https://www.chessprogramming.org/Triangular_PV-Table)
    - [TT](https://www.chessprogramming.org/Transposition_Table)
        - [Zobrist Hashing](https://www.chessprogramming.org/Zobrist_Hashing)
    - [Null Move Pruning](https://www.chessprogramming.org/Null_Move_Pruning)
        - [Double Null Move](https://www.chessprogramming.org/Double_Null_Move) _to be readded_
    - [Razoring](https://www.chessprogramming.org/Razoring#LimitedRazoring)
    - [LMR](https://www.chessprogramming.org/Late_Move_Reductions)
    - [Futility Pruning](https://www.chessprogramming.org/Futility_Pruning)
    - [iterative deepening](https://www.chessprogramming.org/Iterative_Deepening)
    - [mate distance pruning](https://www.chessprogramming.org/Mate_Distance_Pruning)
    - [Quiescence Search](https://www.chessprogramming.org/Quiescence_Search)
        - [check extensions](https://www.chessprogramming.org/Check_Extensions) (check-evaders for the moment)
        - [delta pruning](https://www.chessprogramming.org/Delta_Pruning)
        - Hard cutoff (to prevent [search explosion](https://www.chessprogramming.org/Search_Explosion))
    - [Move Orderning](https://www.chessprogramming.org/Move_Ordering)
        - [MVV LVA](https://www.chessprogramming.org/MVV-LVA)
        - [History Heuristic](https://www.chessprogramming.org/History_Heuristic)
        - [Killer Moves Heuristic](https://www.chessprogramming.org/Killer_Heuristic)
        - [TT score](https://www.chessprogramming.org/Transposition_Table)
        - Eval score
- [UCI](./engine-interface.md) interface (not fully supported)

## Why _Réglisse_ ?
As for [Ramsès-Chess](https://github.com/PaulJeFi/ramses-chess), I took a cat name. Réglisse is one of my friend's cat.

## Special Thanks
Take a look at the [thanks file](./THANKS.md) to see people who made this project possible.

## LICENSE
See the [license file](./LICENSE.txt) to know more about legal stuffs.

## How to use
Réglisse supports some basics commands of the [UCI interface](./engine-interface.md). Few more commands exist :
   - ```move [move]``` : make the move (in UCI format) on the board
   - ```undo``` : undo the last move
   - ```go move``` : make the engine search and play its move on the board
   - ```go perft [X]``` : perft depth X debugging function
   - ```d``` : displays the board, the [FEN](https://www.chessprogramming.org/Forsyth-Edwards_Notation) and the [hash key](https://www.chessprogramming.org/Zobrist_Hashing) of the current position
   - ```eval``` : displays the static evaluation of the current position (do not displays mate, mate scores are handled in search)

You can run Réglisse in your favorite UCI GUI or in the terminal with [this script](./src/JavaScript/reglisse.sh). You may have to authorize access to this script first (```$ chmod +x [path to scipt]``` on MacOS and Linux). You need [node](https://nodejs.org/en/) to run Réglisse locally. You may have to modify ```/usr/local/bin/node``` on [the script](./src/JavaScript/reglisse.sh) to the path to node on your system.

You can also play against Réglisse on [its Lichess account](https://lichess.org/@/Ramses-Chess). If it is not online, you can put it online with you Google account by running [this notebook](https://colab.research.google.com/drive/1LMiJFNrYA5y6VFbmFUsrFBujLUU5Cq4A?usp=sharing) (select the code cell and hit ```SHIFT + ENTER```) or [this script](./lichess/script.sh).

## UCI Options
To see all availables UCI options, look at [this file](./UCI_options.md).