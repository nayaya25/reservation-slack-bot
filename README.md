# Slack bot with Node.js

This repository contains the code for a simplistic Slack Bot that takes table reservation orders 

## Setting up the project

* In your terminal, create directory `building-bots-res` and **change into it**.
* Run 
  ```bash
  git clone --bare git@github.com:danielkhan/building-bots-reservation.git .git
  git config --bool core.bare false
  git reset --hard
  git branch
  ```
* With a branch you want to use checked out, run `npm install` and `npm run dev`
* This will run the application via nodemon and it will listen on `http://localhost:3000`
