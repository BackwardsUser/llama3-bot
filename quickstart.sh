node_version=$(node -v 2>&1)

if [[ $? -eq 0 && $node_version =~ v[0-9]+\.[0-9]+ ]]; then
  echo "Attempting NPM Update..."
  npm i -g npm@latest
  echo "Installing Dependencies."
  npm i
  read -p "Enter your BOT token: " userkey
  echo "TOKEN=\"$userkey\"" > .env
  echo "Applied Token."
  read -p "Press ENTER to start the bot.\nEnsure you've change the config file to your liking."
  npm test
else
  echo "Please install NodeJS before running this script."
  read -p "Press ENTER to close this screen"
fi