node_version=$(node -v 2>&1)

if [[ $? -eq 0 && $node_version =~ v[0-9]+\.[0-9]+ ]]; then
  if [ ! -e .env ]; then
    echo "Attempting NPM Update..."
    npm i -g npm@latest
    echo "Installing Dependencies."
    npm i
    read -p "Enter your BOT token: " userkey
    echo "TOKEN=\"$userkey\"" > .env
    echo "Applied Token."
  else
    echo "Installation already complete, skipping."
  fi
  echo "Press ENTER to start the bot."
  read -p "Ensure you've changed the config file to your liking."
  npm test
else
  echo "Please install NodeJS before running this script."
  read -p "Press ENTER to close this screen"
fi
