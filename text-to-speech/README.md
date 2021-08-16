# Text to Speech

Converts a text file to an mp3 with same filename. Powered by Google Cloud Speech-to-Text.
Depends on GOOGLE_APPLICATION_CREDENTIALS env being set (to eg. ~/.config/google-credentials.json)

## Usage
run `npm install`, then run eg: `node convert.js contacts.txt`. 4500 char limit per file exists.
