# UCI Options in Reglisse

When you type ```uci``` while using Reglisse-JS in the console, you see the following text :

```
id name Reglisse-JS
id author Paul JF

option name UCI_EngineAbout type string default Reglisse-JS by Paul JF, see https://github.com/PaulJeFi/reglisse-chess
option name Clear Tables type button
option name Skill type spin default 20 min 0 max 20
option name Hash type spin default 128 min 4 max 256
option name Move Overhead type spin default 10 min 0 max 10000
option name UCI_AnalyseMode type check default false
option name MultiPV type spin default 1 min 1 max 500
option name UCI_ShowWDL type check default false
option name UseBook type check default true
option name Book File type string default TSCP_book.txt
option name Show HashFull type check default false
option name Depth Infinite type spin default 5 min 1 max 30
option name Contempt type spin default 0 min -250 max 250
option name Style type combo default Balanced var Active var Balanced var Passive
option name ShowEBF type check default false
uciok
```

This text shows the differents options availables in Reglisse, and are handled by your GUI.
This is a guide to understand the differents options.

## UCI_EngineAbout
This option has not to be changed, it is just a little informational text about the engine.

## Clear Tables
Clear the Hash Table and differents other tables (History Heuristic, Killer Moves).

## Skill
The Skill of the engine. The range value is from 0 to 20, where 20 corresponds to Reglisse playing at full strength, and 0 is the lowest strength. The default value is 20.

## Hash
The size of the Hash Table in megabyte (MB). This value should be an integer between 4 and 256, the default value is 128. It is recommanded to set a bigger Hash Size when using a longer time control.

## Move Overhead
This is the time in milliseconds used to compensate the delay in the connection with the GUI or the network. The default value is 10 ms, and can be set from 0 ms to 10000 ms (10 s).

## UCI_AnalyseMode
By default, when there is only one legal move, Reglisse returns it without analysing the position. This help to not loose time when playing games. But for analizing purpose, you can activate UCI_AnalyseMode, the "analyse mode". 

## MultiPV
Outputs the ```n``` best lines. Leave to ```1``` for best performance. **WARNING :** this is still in development and inaccurate ! Unless it is really needed, better is to leave to ```1```. Do not analyse games with this option !

## UCI_ShowWDL
Default is false. If enabled, the engine shows the estimated chance of winning, drawing and loosing the game.

## UseBook
Decide if the engine should use an opening book. This is true by default. For the moment, book are not fully fonctionnal. Note that the suported book format is not usual, see [this file](./src/book_tools/readme.md) to know how to create your own Reglisse book.

## Book File
The book the engine should use. By default, the book is TSCP's book by [Tom Kerrigan](http://www.tckerrigan.com).

## Show HashFull
This otpion is set to false by default. If true, it give the hashfull number, in permile, showing how the TT table is full. If this value is too hight, it is recommanded to clear the tables (Clear Tables option) or to increase TT Size (Hash option). Warning : activating this option can make the engine a little bit slower.

## Depth Infinite
If using a GUI and using Reglisse as an analysing tool at infinite depth, the real depth is limited because Reglisse does not responds to the ```stop``` command. So this option is to set the depth to search at "infinite" search. The default value is 5 (most of the time really fast), and has to be a value between 1 and 30 (searching by time and not by depth is recommanded).

## Contempt
How should the engine respect its opponent. Higher comptempt will make the engine play more riskly for a win.

## Style
The style the engine plays. Leave to ```Balanced``` for full strength.

## ShowEBF
Displays the _Effective Branching Factor_, an indication of how the search tree is expanded when depth increases. Disabled by default because it is not supported by every GUI.