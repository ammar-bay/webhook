#!/bin/bash

#give permission for everything in the express-app directory
sudo chmod -R 777 /home/ubuntu/unifiedchat-server

#navigate into our working directory where we have all our github files
cd /home/ubuntu/unifiedchat-server

#add npm and node to path
export NVM_DIR="$HOME/.nvm"	
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # loads nvm	
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # loads nvm bash_completion (node is in path now)

#install node modules
npm install

sudo fuser -k 8900/tcp

#start our node app in the background
# node server.js > app.out.log 2> app.err.log < /dev/null & 