#!/bin/bash
cd "$(dirname "$0")"
git clone https://github.com/lichess-bot-devs/lichess-bot.git
cd lichess-bot
pip3 install -r requirements.txt
cd ..
cp config.yml lichess-bot/config.yml
cp reglisse.sh lichess-bot/engines/reglisse.sh
cp book1.bin lichess-bot/engines/book1.bin
cd lichess-bot
chmod +x engines/reglisse.sh
python3 lichess-bot.py -v