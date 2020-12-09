# Crypto-bot by Ryan Miller  

> :warning: **This app is designed to be self-hosted so that you never need to give anyone your Coinbase Pro API keys**

Crypto-bot is an open source app built with the idea of dollar-cost-averaging investments into cryptocurrencies (like Bitcoin, Ethereum, etc). This app uses the Coinbase Pro (CBP) API to provide features and data not available via standard Coinbase or Coinbase Pro web interfaces.  
For example, using Crypto-bot enables:
- Low transaction fees (0.5%)
- Scheduled and recurring market buys at customizable interval
- Scheduled and recurring limit buys at customizable interval

## Security
Please use at your own risk, and never share your API keys.
- Crypto-bot utilizes JSON Web Tokens (JWT) to secure all API interactions. 
- Coinbase Pro API keys are stored encrypted (AES-256-CBC) and never exposed.
- User sessions expire every 60 minutes (token expiration)
  

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
  
  
## FAQ
Q: *How is the minimum buy amount determined?*  
A: Each product (cryptocurrency) listed on Coinbase Pro has a `base_min_size` defined, which is the smalled unit of that that crypto currency that can be bought/sold in a transaction. Keep in mind that there is also a `base_increment` size which defines the most precise level of precision (in terms of token size) which a buy can be made for. Any buys with a higher precision will be rejected. This bot will round any request to the nearest increment (e.g. a buy order for 1.005 LINK, will become a buy for 1.02 LINK). 

Q: *Does Crypto-bot allow selling?*  
A: No. This tool is strictly for dollar cost averaging into crypto. No current plans to add selling fucntionality.

Q: *Can I automatically add funds from my bank?*  
A: Currently there is no way to tranfser funds from your bank account using the Coinbase Pro API. However, it does allow transfer of funds from Coinbase --> Coinbase Pro. In a future release of Crypto-bot, it will be possible to fund your Coinbase Pro account with USDC that's been automatically transferred using Coinbase regularly scheduled buys (USDC-only, because it is fee-free throughout Coinbase platform).