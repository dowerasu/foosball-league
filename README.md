# Node JS check in/out system with a chat

This repo uses JSON Web Tokens and the jsonwebtoken package to implement token based authentication on a simple Node.js API.

This is a starting point to demonstrate the method of authentication by verifying a token using Express route middleware.

## Requirements

* node and npm

## Usage

* Clone the repo: `git clone https://github.com/dowerasu/foosball-league`
* Install dependencies: `npm install`
* Change SECRET in `config.js`
* Add your own MongoDB database to `config/database.js`
* Add your own Faceboo and Google aplication IDs to `config/auth.js`
* Start the server: `node server.js` (server port can be changed at line 3)
* Once server is running go to index page at specified port
* After loging in with the desired method you will be redirected to `/profile` page
* After that you can go to `/home` page to see the chat

## Warning

Local user registration passwords are not encrypted due to installation issues with `bcrypt` library
For tutorials about `bcrypt` please checkout `https://www.youtube.com/watch?v=au2pDQ_tgD8&list=PLZm85UZQLd2Q946FgnllFFMa0mfQLrYDL&index=10`
