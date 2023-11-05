const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const fastcsv = require("fast-csv");
const { resolve } = require("path");

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
          res.json(results);
        } else {
          res.json("No results found.");
        }
      });
  } catch (error) {
    res.status(500).send("Error reading the file");
    console.log(error);
  }
});

app.get("/query/:itemNumber", async (req, res) => {
  try {
    const itemToSearch = req.params.itemNumber;
    const results = [];
    fs.createReadStream("./catalog.csv")
      .pipe(csv())
      .on("data", (row) => {
        if (row.item_number === itemToSearch) {
          results.push(row);
        }
      })
      .on("end", () => {
        if (results.length > 0) {
          res.json(results);
        } else {
          res.json("No results found.");
        }
      });
  } catch (error) {
    res.status(500).send("Error reading the file");
  }
});

app.get("/update/:item_number", async (req, res) => {
  try {
    const itemToUpdate = req.params.item_number;
    const items = [];
    var stock;
    let book_name = "";
    await fs
      .createReadStream("./catalog.csv")
      .pipe(csv())
      .on("data", (row) => {
        // console.log(row);
        items.push(row);
      })
      .on("end", () => {
        let responseMessage = { message: "", book_name: "" };
        items.forEach((row) => {
          if (row.item_number === itemToUpdate) {
            book_name = row.title;
            stock = parseInt(row.items_in_stock, 10);
            if (stock == 0) {
              responseMessage.message = "No stock. Sold out.";
              res.json(responseMessage);
            } else {
              row.items_in_stock = stock - 1;
            }
          }
        });
        if (responseMessage.message !== "No stock. Sold out.") {
          const writeStream = fs.createWriteStream("output.csv");

          fastcsv
            .writeToStream(writeStream, items, { headers: true })
            .on("finish", () => {
              console.log("Data has been updated and written to output.csv");
              responseMessage.message = "Stock updated successfully";
              responseMessage.book_name = book_name;

              res.json(responseMessage);
              fs.renameSync("output.csv", "./catalog.csv");
            });
        }
      });
  } catch (error) {
    res.status(500).send("Error reading the file");
  }
});

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
