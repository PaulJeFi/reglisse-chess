# Book Tools

Books format used in Reglisse are not usuals. They are in the same format than TSCP's book by [Tom Kerrigan](http://www.tckerrigan.com). Here is explained how to create your own Reglisse book, based on a Polyglott or a PGN file.

First, you have to inslatall ```python-chess``` :

```
$ pip3 install python-chess
```

Every script has to be run from the root of this project.

## From a PGN file

To create your book from a PGN file, place the PGN file, named ```games.pgn``` in this folder. Next, open [this file](./pgn_to_book.py) and modify the ```max_moves``` variable to limit the number of moves in the same line. Once it's done, you just have to run the script, and your book will be created, named ```book.txt```.

## From a Polyglott book

To create your book from a Polyglott book, place the book, named ```book.bin``` in this folder. Once it's done, you just have to run [this script](./polyglott_to_book.py), and your book will be created, named ```book.txt```.