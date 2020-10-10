# Crypto-bot by Ryan Miller  

> :warning: **This app is designed to be self-hosted so that you never need to give anyone your Coinbase Pro API keys**

Crypto-bot is an open source app built with the idea of dollar-cost-averaging investments into cryptocurrencies (like Bitcoin, Ethereum, etc). This app uses the Coinbase Pro (CBP) API to provide features and data not available via standard Coinbase or Coinbase Pro web interfaces.  
For example, using Crypto-bot enables:
- Low transaction fees (0.5%)
- Scheduled and recurring market buys at customizable interval
- Scheduled and recurring limit buys at customizable interval

## Security
Please use at your own risk, and never share your API keys.
- Crypto-bot utilizes JSON Web Token (JWT) to secure interactions between the application front-end and back-end services. 
- Coinbase Pro API keys are stored encrypted (AES-256-CBC) in the MongoDB database and never exposed back to user/front-end.
- User sessions expire every 60 minutes (based on JWT / Access Token expiration)
  

<br />
<br /><p align="center">
<img src="http://g.recordit.co/XHwASNetDH.gif"
     alt="App overveiw"
     style="margin-right: 0 auto; max-width: 80%" />  
</p>

## Installation

This app depends on a MongoDB database. Please install MongoDB before building. 

> Clone the repo to your local machine
```
$   git clone https://github.com/TheRyanMiller/crytpo-bot
```
> At the root of the project, make a copy of the `.env.example` file, and rename it to simply `.env`. Populate this file with your Coinbase API keys and other environment variables (e.g. MongoDB connection string and credentials).  

> Do the same for the `.env.example` file in the `/client` directory.  

> Change into the project directory and install the server-side NPM packages, and then the client-side NPM packages.
```
$   cd crypto-bot
$   npm install
$   cd client
$   npm install
```

> Issue this command from the root `/` directory to launch the server locally using the typescript engine.
```
$   ts-node server.js
```

> Issue this command from the `/client` directory to launch the app locally
```
$   npm run
```