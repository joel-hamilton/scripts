# Format Transactions
I have a deal with my wife where I build/maintain a few budgeting spreadsheets and scripts, and she does all the real work each month. This script is pretty specific to our particular budgeting workflow. It searches for downloaded CSV transactions, and consolidates them into a single CSV with categories intelligently added.

Usage: 
- Run `npm install`
- Populate `categories.js` with arrays of string matches and/or matching functions
- Download some transactions
- Run `node format.js`