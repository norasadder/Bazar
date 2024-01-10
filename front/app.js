const express = require("express");
const axios = require("axios");
const LRU = require("lru-cache");
const app = express();
const port = 3000;

const options = {
  max: 5, // The maximum size of the cache
  ttl: 1000 * 60 * 60, // Items are removed after an hour
};
const cache = new LRU(options);

app.get("/purchase/:item_number", async (req, res) => {
  try {
    const startTime = new Date();
    const itemToPurchase = req.params.item_number;
    const orderServerUrl = "http://order:3000"; // Fixed URL for the order server

    // Invalidate cache related to this item
    // console.log(cache);
    cache.delete(`info-${itemToPurchase}`);
    // console.log("This request ${itemToPurchase} is removed from the cache ");
    // console.log(cache);

    const purchaseResponse = await axios.get(
      `${orderServerUrl}/purchase/${itemToPurchase}`
    );
    const endTime = new Date();
    const elapsedTime = endTime - startTime;
    // console.log("time for purchase:", elapsedTime, "ms");
    if (purchaseResponse.status === 200) {
      res.json(purchaseResponse.data);
    } else {
      res.status(500).json({ error: "Unexpected response from order server" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing the purchase" });
  }
});

app.get("/info/:item_number", async (req, res) => {
  try {
    const startTime = new Date();
    const itemToQuery = req.params.item_number;
    const cacheKey = `info-${itemToQuery}`;
    // console.log("cache when request received: ", cache.keyList);
    // Check if the item is in the cache
    if (cache.has(cacheKey)) {
      // console.log("this request is cached");
      const val = cache.get(cacheKey);
      const endTime = new Date();
      const elapsedTime = endTime - startTime;
      // console.log("time for info -- cached:", elapsedTime, "ms");
      return res.json(val);
    }

    // console.log("this request is not cached");

    const catalogServerUrl = "http://catalog:3000";
    const queryResponse = await axios.get(
      `${catalogServerUrl}/query/itemNumber/${itemToQuery}`
    );
    const endTime = new Date();
    const elapsedTime = endTime - startTime;
    // console.log("time for info:", elapsedTime, "ms");
    if (queryResponse.status === 200) {
      // Store the response in cache before returning
      // console.log(cache.keyList);
      cache.set(cacheKey, queryResponse.data);
      // console.log(cache.keyList);
      res.json(queryResponse.data);
    } else {
      res
        .status(500)
        .json({ error: "Unexpected response from catalog server" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing the query" });
  }
});

app.get("/search/:topic", async (req, res) => {
  try {
    const startTime = new Date();
    const topicToSearch = req.params.topic;
    const cacheKey = `search-${topicToSearch}`;
    // console.log("cache when request received: ", cache.keyList);
    // Check if the item is in the cache
    if (cache.has(cacheKey)) {
      // console.log("this request is cached");
      const val = cache.get(cacheKey);
      const endTime = new Date();
      const elapsedTime = endTime - startTime;
      // console.log("time for search by topic -- cached:", elapsedTime, "ms");
      return res.json(val);
    }

    // console.log("this request is not cached");
    const catalogServerUrl = "http://catalog:3000";
    const queryResponse = await axios.get(
      `${catalogServerUrl}/query/subject/${topicToSearch}`
    );

    const endTime = new Date();
    const elapsedTime = endTime - startTime;
    // console.log("time for search by topic:", elapsedTime, "ms");

    if (queryResponse.status === 200) {
      // Store the response in cache before returning
      cache.set(cacheKey, queryResponse.data);

      res.json(queryResponse.data);
    } else {
      res
        .status(500)
        .json({ error: "Unexpected response from catalog server" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing the query" });
  }
});

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
