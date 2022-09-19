import chess
import chess.polyglot

board = chess.Board()
lines = ''

with chess.polyglot.open_reader("./src/book_tools/book.bin") as reader :
    def line (board: chess.Board) :
        global lines
        for entry in reader.find_all(board) :
            board.push(entry.move)
            line(board)
            lines += ' '.join([str(move) for move in board.move_stack]) + '\n'
            board.pop()
    try :
        line(board)
    except Exception :
        print('Stopped here')
    with open('./src/book_tools/book.txt', 'w') as Table :
        Table.write(lines)