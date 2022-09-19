import chess
import chess.pgn
import time

max_moves = 10

Time = time.time()
lines = ''
game = 0
with open('./src/book_tools/games.pgn') as pgn :
    while True :
        try :
            actual_game = chess.pgn.read_game(pgn)
            board = actual_game.board()
            game += 1
            moves = 0
            print('Game :', game)
            for move in actual_game.mainline_moves() :
                lines += str(move) + ' '
                moves += 1
                board.push(move)
                if moves >= max_moves :
                    break
            lines = lines[:-1]
            lines += '\n'
        except Exception :
            break
print('Parsing finished, time', time.time()-Time)
with open('./src/book_tools/book.txt', 'w') as Table :
    Table.write(lines)
print('Finished, time :', time.time()-Time)