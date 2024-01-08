require('dotenv').config()

const axios = require('axios').default;

const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const port = process.env.PORT || 3000;

const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const cors = require('cors');
app.use(cors());

// Limiter
const limiter = rateLimit({
    windowMs: 1000 // 1 second
})
// Appl to all requests
app.use(limiter)

// Port
let server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
server.timeout = 60_000;

// Routes
// All NFTs based on user address
app.get("/Moralis/WalletNFTs/:chain/:address", async (req, res) => {
    console.log('\nRequest to /Moralis/WalletNFTs/:chain/:address');

    try {
        if (!Moralis.Core.isStarted) {
            await Moralis.start({
                apiKey: process.env.MORALIS_API_KEY
            });
        }

        const chain = EvmChain[req.params.chain];

        const address = req.params.address;

        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            address,
            chain
        });

        console.log('Request fulfilled\n');
        res.send(response.toJSON());
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
});
// Filtered NFTs based on chain, user address and collection address
app.get("/Moralis/WalletNFTs/:chain/:address/:collection", async (req, res) => {
    console.log('\nRequest to /Moralis/WalletNFTs/:chain/:address/:collection');

    try {
        if (!Moralis.Core.isStarted) {
            await Moralis.start({
                apiKey: process.env.MORALIS_API_KEY
            });
        }

        const chain = EvmChain[req.params.chain];

        const address = req.params.address;

        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            address,
            chain,
        });

        let responseJSON = response.toJSON();

        const filteredResponse = responseJSON.result.filter(x => {
            return x.token_address.toLowerCase() === req.params.collection.toLowerCase()
        })

        console.log('Request fulfilled\n');
        res.send(filteredResponse)
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
});
// Get price of a specific ERC20 token based on chain and token address
app.get("/Moralis/TokenPrice/:chain/:address/:assetPriceId", async (req, res) => {
    console.log('\nRequest to /Moralis/TokenPrice/:chain/:address/:assetPriceId');

    try {
        if (!Moralis.Core.isStarted) {
            await Moralis.start({
                apiKey: process.env.MORALIS_API_KEY
            });
        }

        const chain = EvmChain[req.params.chain];

        const address = req.params.address;

        const moralisResponse = await Moralis.EvmApi.token.getTokenPrice({
            address,
            chain,
        });

        // Get asset price id
        let assetPriceId = req.params.assetPriceId.toLowerCase();
        requestURL = "https://api.coingecko.com/api/v3/coins/list"
        let correctId = false;
        let coinList;

        coinList = await axios.get(requestURL)
            .then(function (res) {
                console.log("Correct server response");
                return res.data;
            });
        for (var e in coinList) {
            if (coinList[e].id == assetPriceId) {
                correctId = true
            }
        }

        // Get asset price over usd
        let requestedPrice;
        requestURL = 'https://api.coingecko.com/api/v3/simple/price?ids=' + assetPriceId + '&vs_currencies=' + 'usd' + '&precision=full';

        requestedPrice = await axios.get(requestURL)
            .then(function (res) {
                console.log("Correct server response");
                return res.data;
            });

        const response = { price: moralisResponse.toJSON().usdPrice / requestedPrice[assetPriceId].usd }

        console.log('Request fulfilled\n');
        res.send(response)
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
});
// Get opensea collection Infos based on collection name
app.get("/QuarryDraw/OpenseaCollection/:collectionName", async (req, res) => {
    console.log('\nRequest to /QuarryDraw/OpenseaCollection/:collectionName');

    try {
        let requestURL = "https://api.opensea.io/api/v1/collection/" + req.params.collectionName;
        let response;

        response = await axios.get(requestURL)
            .then(function (res) {
                console.log("Correct server response");
                return res.data;
            });

        console.log('Request fulfilled\n');
        res.send(response)
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
});
// Get opensea collection floor and/or marketcap based on collection name and valued by asset
app.get("/QuarryDraw/OpenseaCollection/:collectionName/:assetPriceId/:floor/:marketcap", async (req, res) => {
    console.log('\nRequest to /QuarryDraw/OpenseaCollection/:collectionName/:assetPriceId/:floor/:marketcap')

    let requestURL;
    try {
        // Get asset price id
        let assetPriceId = req.params.assetPriceId.toLowerCase();
        requestURL = "https://api.coingecko.com/api/v3/coins/list"
        let correctId = false;
        let coinList;

        coinList = await axios.get(requestURL)
            .then(function (res) {
                console.log("Correct server response");
                return res.data;
            });

        for (var e in coinList) {
            if (coinList[e].id == assetPriceId) {
                correctId = true
            }
        }
        if (!correctId) throw { message: "WRONG_ID, availability at https://api.coingecko.com/api/v3/coins/list" };

        // Get asset price over eth
        let assetPriceInEth;
        requestURL = 'https://api.coingecko.com/api/v3/simple/price?ids=' + assetPriceId + '&vs_currencies=' + 'eth' + '&precision=full';
        assetPriceInEth = await axios.get(requestURL)
            .then(function (res) {
                console.log("Correct server response");
                return res.data;
            });

        // Get opensea floor price
        let collectionName = ((req.params.collectionName).toLowerCase()).replace(" ", "-");
        let collectionInfo;
        requestURL = 'https://api.opensea.io/api/v1/collection/' + collectionName;
        collectionInfo = await axios.get(requestURL)
            .then(function (res) {
                console.log("Correct server response");
                return res.data;
            });

        // Caluculate floor and marketcap based on asset price
        let response = {
            // floor: 0,
            // marketcap: 0
        }

        if (req.params.floor == 'true') response.floor = collectionInfo.collection.stats.floor_price / assetPriceInEth[assetPriceId].eth
        if (req.params.marketcap == 'true') response.marketcap = collectionInfo.collection.stats.market_cap / assetPriceInEth[assetPriceId].eth

        console.log('Request fulfilled\n');
        res.send(response);
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
});