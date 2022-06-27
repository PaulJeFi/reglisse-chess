from board import Board
from iterative_deep import iterative_deepening

def main() -> None :

    board = Board()

    while True :

        inp = input().split()

        try :
            
            if inp[0] == 'uci' :
                print('id name Réglisse\nid author Paul JF\nuciok')

            elif inp[0] == 'isready' :
                print('readyok')

            elif inp[0] == 'ucinewgame' :
                board = Board()

            elif inp[0] == 'd' :
                print(board.fen())

            elif inp[0] == 'quit' :
                break

            elif inp[0] == 'position' :

                try : # if fen is invalid

                    if inp[1] == 'startpos' :
                        board = Board()

                    elif inp[1] == 'fen' :

                        if 'moves' in inp :
                            board = Board(
                                ' '.join(inp[2:inp.index('moves')])
                                )
                        else :
                            board = Board(' '.join(inp[2:]))

                    if 'moves' in inp :
                        for move in inp[inp.index('moves')+1:] :
                            board.push(board.readMove(move))

                except Exception :
                    print('Invalid FEN or moves')

            elif inp[0] == 'go' :

                depth = 3
                MOVE = False

                if 'depth' in inp :
                    depth = int(inp[inp.index('depth')+1])
                if 'move' in inp :
                    MOVE = True

                move, evalu = iterative_deepening(board, depth)
                if MOVE :
                    board.push(move)

            elif inp[0] == 'move' :
                move = board.readMove(inp[1])
                if move != None :
                    board.push(move)


        except IndexError :
            pass

if __name__ == '__main__' :
    main()