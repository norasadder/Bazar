const express = require("express");
const axios = require("axios");
const LRU = require("lru-cache");
const app = express();
const port = 3000;

 const options = {
  max: 5, // The maximum size of the cache
  ttl: 1000 * 60 * 60 // Items are removed after an hour
};
const cache = new LRU(options);

app.get("/purchase/:item_number", async (req, res) => {
  try {
    const itemToPurchase = req.params.item_number;
    const orderServerUrl = "http://order:3000"; // Fixed URL for the order server

    // Invalidate cache related to this item
    cache.delete(`info-${itemToPurchase}`);
    console.log("This request ${itemToPurchase} is removed from the cache ")

    const purchaseResponse = await axios.get(`${orderServerUrl}/purchase/${itemToPurchase}`);

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
    const itemToQuery = req.params.item_number;
    const cacheKey = `info-${itemToQuery}`;

    // Check if the item is in the cache
    if (cache.has(cacheKey)) {
      console.log("this request is cached")
      return res.json(cache.get(cacheKey));
    }

    console.log("this request is not cached")
    const catalogServerUrl = "http://catalog:3000";
    const queryResponse = await axios.get(
      `${catalogServerUrl}/query/itemNumber/${itemToQuery}`
    );

    if (queryResponse.status === 200) {
      // Store the response in cache before returning
      cache.set(cacheKey, queryResponse.data);
      res.json(queryResponse.data);
    } else {
      res.status(500).json({ error: "Unexpected response from catalog server" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing the query" });
  }
});

app.get("/search/:topic", async (req, res) => {
  try {
    const topicToSearch = req.params.topic;
    const cacheKey = `search-${topicToSearch}`;

    // Check if the item is in the cache
    if (cache.has(cacheKey)) {
      console.log("this request is cached")
      return res.json(cache.get(cacheKey));
    }

    console.log("this request is not cached")
    const catalogServerUrl = "http://catalog:3000";
    const queryResponse = await axios.get(
      `${catalogServerUrl}/query/subject/${topicToSearch}`
    );

    if (queryResponse.status === 200) {
      // Store the response in cache before returning
      cache.set(cacheKey, queryResponse.data);
      res.json(queryResponse.data);
    } else {
      res.status(500).json({ error: "Unexpected response from catalog server" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing the query" });
  }
});


// // order a book by calling the order server api
// app.get("/purchase/:item_number", async (req, res) => {
//   try {
//     const itemToPurchase = req.params.item_number;
//     const orderServerUrl = "http://order:3000";
//     const queryResponse = await axios.get(
//       `${orderServerUrl}/purchase/${itemToPurchase}`
//     );
//     if (queryResponse.status === 200) {
//       res.json(queryResponse.data);
//     } else {
//       res.status(500).json({ error: "Unexpected response from order server" });
//     }
//   } catch (error) {
//     // Handle any errors that occur during the purchase process
//     console.error(error);
//     res.status(500).json({ error: "Error processing the purchase" });
//   }
// });

// // searching for an item by calling the catalog server api based on the item number
// app.get("/info/:item_number", async (req, res) => {
//   try {
//     const itemToQuery = req.params.item_number;
//     const catalogServerUrl = "http://catalog:3000";
//     const queryResponse = await axios.get(
//       `${catalogServerUrl}/query/itemNumber/${itemToQuery}`
//     );
//     if (queryResponse.status === 200) {
//       res.json(queryResponse.data);
//     } else {
//       res
//         .status(500)
//         .json({ error: "Unexpected response from catalog server" });
//     }
//   } catch (error) {
//     // Handle any errors that occur during the purchase process
//     console.error(error);
//     res.status(500).json({ error: "Error processing the query" });
//   }
// });

// // searching for an item by calling the catalog server api based on the topic
// app.get("/search/:topic", async (req, res) => {
//   try {
//     const topicToSearch = req.params.topic;
//     const catalogServerUrl = "http://catalog:3000";
//     const queryResponse = await axios.get(
//       `${catalogServerUrl}/query/subject/${topicToSearch}`
//     );
//     if (queryResponse.status === 200) {
//       res.json(queryResponse.data);
//     } else {
//       res
//         .status(500)
//         .json({ error: "Unexpected response from catalog server" });
//     }
//   } catch (error) {
//     // Handle any errors that occur during the purchase process
//     console.error(error);
//     res.status(500).json({ error: "Error processing the query" });
//   }
// });

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
