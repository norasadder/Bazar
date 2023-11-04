const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const app = express();
const port = 3000;

app.get("/subject/:topic", async (req, res) => {
  try {
    const topicToSearch = req.params.topic;
    const results = [];
    fs.createReadStream("./catalog.csv")
      .pipe(csv())
      .on("data", (row) => {
        if (row.topic === topicToSearch) {
          results.push(row);
        }
      })
      .on("end", () => {
        if (results.length > 0) {
          res.send(results);
        } else {
          res.send("No results found.");
        }
      });
  } catch (error) {
    res.status(500).send("Error reading the file");
    console.log(error);
  }
});

app.get("/:item", async (req, res) => {
  try {
    const itemToSearch = req.params.item;
    const results = [];
    fs.createReadStream("./catalog.csv")
      .pipe(csv())
      .on("data", (row) => {
        if (row.item === itemToSearch) {
          results.push(row);
        }
      })
      .on("end", () => {
        if (results.length > 0) {
          res.send(results);
        } else {
          res.send("No results found.");
        }
      });
  } catch (error) {
    res.status(500).send("Error reading the file");
  }
});

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
