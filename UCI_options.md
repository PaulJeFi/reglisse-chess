# UCI Options in Réglisse

When you type ```uci``` while using Réglisse in the console, you see the following text :

```
id name Réglisse-JS
id author Paul JF

option name Clear Tables type button
option name Skill type spin default 20 min 0 max 20
option name Hash type spin default 128 min 4 max 256
option name Move Overhead type spin default 10 min 0 max 10000
option name UCI_AnalyseMode type check default false
uciok
```

This text shows the differents options availables in Réglisse, and are handled by your GUI.
This is a guide to understand the différents options.

## Clear Tables
Clear the Hash Table and differents other tables (History Heuristic, Kuller Moves).

## Skill
The Skill of the engine. The range value is from 0 to 20, where 20 correspond to Réglisse playing at full strength, and 0 is the lower strength. The default value is 20.

## Hash
The size of the Hash Table in megabyte (MB). This value should be in integer between 4 and 256, the default value is 128. It is recommanded to set a bigger Hash Size when using a longer time controll.

## Move Overhead
This is the time in milliseconds used to compensate the delay in the connection with the GUI or the network. The default value is 10 ms, and can be set from 0 ms to 10000 ms (10 s).

## UCI_AnalyseMode
By default, when there is only one legal move, Réglisse returns it without analysing the position. This help to not loose time when playing games. But for analizing purpose, you can activate UCI_AnalyseMode, the "analyse mode". 