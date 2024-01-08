# Quarry Draw Oracle

This is a three repo project: [Quarry Draw Oracle](https://github.com/Puddi1/QD-Oracle), Quarry Draw Oracle Server and [Quarry Draw Validator Contracts](https://github.com/Puddi1/QD-Validator-Contracts).

The project consist of an on-chain price feed Oracle.

The Oracle Server uses Moralis APIs endpoints and a suite of QuarryDraw endpoints to fetch on-chain data on request, clean it and send it back. It offers multiple GET endpoints which the Orcale Script can make requests with ease:

All NFTs based on user address and chain:
* `GET /Moralis/WalletNFTs/:chain/:address/`

Filtered NFTs based on chain, user address and collection address:
* `GET /Moralis/WalletNFTs/:chain/:address/:collection/`

Get price of a specific ERC20 token based on chain and token address:
* `GET /Moralis/TokenPrice/:chain/:address/:assetPriceId/`

Get opensea collection Infos based on collection name:
* `GET /QuarryDraw/OpenseaCollection/:collectionName/`

Get opensea collection floor and/or marketcap based on collection name and valued by asset:
* `GET /QuarryDraw/OpenseaCollection/:collectionName/:assetPriceId/:floor/:marketcap/`

## Usage

Start with adding the environment variables in your `.env` that are needed in the oracle, where:

- `MORALIS_API_KEY` is the Moralis API key.
- `PORT` is the port the Server will listen for requests.

For syntax example refer to `.env.example`

Before running the script install all required packages:
```sh
npm i
```

Then run the Oracle with any js runtime (node):
```sh
node index.js
```
