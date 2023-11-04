const express = require("express");
const axios = require("axios");

const app = express();
const port = 3001;

app.get("/search/:topic", async (req, res) => {
  try {
    const topicToSearch = req.params.topic;
    // Replace 'target-url' with the URL you want to send a GET request to
    const response = await axios.get(
      `http://localhost:3000/subject/${topicToSearch}`
    );

    if (response === "No results found.") {
      res.send("No results found.");
    }

    res.send(response.data); // Send the response from the target URL to the client
  } catch (error) {
    console.error(error);
    res.status(500).send("Error making the request");
  }
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
