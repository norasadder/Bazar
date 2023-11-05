const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

app.get("/purchase/:item_number", async (req, res) => {
  try {
    const itemToPurchase = req.params.item_number;
    const orderServerUrl = "http://order:3000";
    const queryResponse = await axios.get(
      `${orderServerUrl}/purchase/${itemToPurchase}`
    );
    if (queryResponse.status === 200) {
      res.json(queryResponse.data);
    } else {
      res.status(500).json({ error: "Unexpected response from order server" });
    }
  } catch (error) {
    // Handle any errors that occur during the purchase process
    console.error(error);
    res.status(500).json({ error: "Error processing the purchase" });
  }
});

app.get("/info/:item_number", async (req, res) => {
  try {
    const itemToQuery = req.params.item_number;
    const catalogServerUrl = "http://catalog:3000";
    const queryResponse = await axios.get(
      `${catalogServerUrl}/query/${itemToQuery}`
    );
    if (queryResponse.status === 200) {
      res.json(queryResponse.data);
    } else {
      res
        .status(500)
        .json({ error: "Unexpected response from catalog server" });
    }
  } catch (error) {
    // Handle any errors that occur during the purchase process
    console.error(error);
    res.status(500).json({ error: "Error processing the query" });
  }
});

app.get("/search/:topic", async (req, res) => {
  try {
    const topicToSearch = req.params.topic;
    const catalogServerUrl = "http://catalog:3000";
    const queryResponse = await axios.get(
      `${catalogServerUrl}/subject/${topicToSearch}`
    );
    if (queryResponse.status === 200) {
      res.json(queryResponse.data);
    } else {
      res
        .status(500)
        .json({ error: "Unexpected response from catalog server" });
    }
  } catch (error) {
    // Handle any errors that occur during the purchase process
    console.error(error);
    res.status(500).json({ error: "Error processing the query" });
  }
});

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
