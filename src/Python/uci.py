from board import Board
import iterative_deep

def pretty_fen(fen) :
    FEN = ''
    for i in ''.join(fen.replace('/', '').split(' ')[0]) :
        if i.isdigit() :
            FEN += int(i) * ' '
        else :
            FEN += i

    board = ' +---+---+---+---+---+---+---+---+'
    count = 0
    for i in range(8) :
        board += '\n'
        for j in range(8) :
            board += ' | ' + FEN[count]
            count += 1
        board += ' | ' + str(8-i)
        board += '\n +---+---+---+---+---+---+---+---+'
    board += '\n   a   b   c   d   e   f   g   h'
    board += '\n\nFen : ' + fen

    return board

def main() -> None :

    board = Board()
    book = True

    print('Réglisse by Paul JF')

    while True :

        inp = input().split()

        try :
            
            if inp[0] == 'uci' :
                print('id name Réglisse\nid author Paul JF\n')
                print('option name Clear Tables type button')
                print('option name OwnBook type check default true')
                print('uciok')

            elif inp[0] == 'isready' :
                print('readyok')

            elif inp[0] == 'ucinewgame' :
                board = Board()
                iterative_deep.search.reset_tables()

            elif inp[0] == 'd' :
                print()
                print(pretty_fen(board.fen()))
                print('Key : {}'.format(
                    hex(iterative_deep.search.zobrist.hash(board))[2:].upper()))
            
            elif inp[0] == 'eval' :
                view = 1 if board.turn else -1
                print('Static eval : {} cp'.format(
                    iterative_deep.search.evaluate(board) * view
                ))

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
                            Move = board.readMove(move)
                            if Move != None :
                                board.push(Move)

                except Exception :
                    print('Invalid FEN or moves')

            elif inp[0] == 'go' :

                depth = 3
                MOVE = False

                if 'depth' in inp :
                    depth = int(inp[inp.index('depth')+1])
                if 'move' in inp :
                    MOVE = True

                move, evalu = iterative_deep.iterative_deepening(board, depth,
                                                                 book)
                if MOVE :
                    board.push(move)

            elif inp[0] == 'move' :
                move = board.readMove(inp[1])
                if move != None :
                    board.push(move)

            elif inp[0] == 'undo' :
                if len(board.move_stack) >= 1 :
                    board.pop(board.move_stack[-1])
            
            elif inp[0] == 'setoption' and inp[1] == 'name':
                if 'Clear' in inp and 'Tables' in inp :
                    iterative_deep.search.reset_tables()
                if 'OwnBook' in inp and 'value' in inp :
                    if 'true' in inp :
                        book = True
                    if 'false' in inp :
                        book = False

        except IndexError :
            pass

if __name__ == '__main__' :
    main()