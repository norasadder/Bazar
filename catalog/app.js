const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const fastcsv = require("fast-csv");
const { resolve } = require("path");

const app = express();
const port = 3000;

// search by topic
app.get("/query/subject/:topic", async (req, res) => {
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

// search by item number
app.get("/query/itemNumber/:itemNumber", async (req, res) => {
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

// decrement the stock given the item number
app.get("/update/decrement/:item_number", async (req, res) => {
  try {
    const itemToUpdate = req.params.item_number;
    const items = [];
    var stock;
    let found = false;
    let book_name = "";
    await fs
      .createReadStream("./catalog.csv")
      .pipe(csv())
      .on("data", (row) => {
        items.push(row);
      })
      .on("end", () => {
        let responseMessage = { message: "", book_name: "" };
        items.forEach((row) => {
          if (row.item_number === itemToUpdate) {
            book_name = row.title;
            stock = parseInt(row.items_in_stock, 10);
            found = true;
            responseMessage.book_name = book_name;
            if (stock === 0) {
              responseMessage.message = "No stock. Sold out.";
              res.json(responseMessage);
            } else {
              row.items_in_stock = stock - 1;
            }
          }
        });
        if (
          responseMessage.message !== "No stock. Sold out." &&
          found === true
        ) {
          const writeStream = fs.createWriteStream("output.csv");

          fastcsv
            .writeToStream(writeStream, items, { headers: true })
            .on("finish", () => {
              console.log("Data has been updated and written to output.csv");
              responseMessage.message = "Stock updated successfully";

              // res.json(
              //   `The quantity of (${book_name}) book has been decremented successfully, old quantity: ${stock} , new quantity: ${
              //     stock - 1
              //   }`
              // );
              res.json(responseMessage);
              fs.renameSync("output.csv", "./catalog.csv");
            });
        } else if (
          responseMessage.message !== "This Item is out of stock" &&
          found === false
        ) {
          res.send({ message: "Item not found in the catalog" });
        }
      });
  } catch (error) {
    res.status(500).send("Error reading the file");
  }
});

// increment the stck given the item number
app.get("/update/increment/:item_number/:quantity", async (req, res) => {
  try {
    const itemToUpdate = req.params.item_number;
    const quantity = req.params.quantity;
    const items = [];
    let found = false;
    var stock;
    let book_name = "";
    await fs
      .createReadStream("./catalog.csv")
      .pipe(csv())
      .on("data", (row) => {
        items.push(row);
      })
      .on("end", () => {
        let responseMessage = { message: "", book_name: "" };
        items.forEach((row) => {
          if (row.item_number === itemToUpdate) {
            book_name = row.title;
            stock = parseInt(row.items_in_stock, 10);
            row.items_in_stock = stock + parseInt(quantity, 10);
            found = true;
          }
        });
        if (found === true) {
          const writeStream = fs.createWriteStream("output.csv");
          fastcsv
            .writeToStream(writeStream, items, { headers: true })
            .on("finish", () => {
              console.log("Data has been updated and written to output.csv");
              responseMessage.message = "Stock updated successfully";
              responseMessage.book_name = book_name;

              res.json(
                `The quantity of (${book_name}) book has been incremented successfully, old quantity: ${stock} , new quantity: ${
                  stock + parseInt(quantity, 10)
                }`
              );
              fs.renameSync("output.csv", "./catalog.csv");
            });
        } else {
          res.send("Item not found in the catalog");
        }
      });
  } catch (error) {
    res.status(500).send("Error reading the file");
  }
});

// update the cost
app.get("/update/cost/:item_number/:cost_value", async (req, res) => {
  try {
    const itemToUpdate = req.params.item_number;
    const newCost = req.params.cost_value;
    const items = [];
    let book_name = "";
    let found = false;
    let oldCost = 0;
    await fs
      .createReadStream("./catalog.csv")
      .pipe(csv())
      .on("data", (row) => {
        items.push(row);
      })
      .on("end", () => {
        let responseMessage = { message: "", book_name: "" };
        items.forEach((row) => {
          if (row.item_number === itemToUpdate) {
            book_name = row.title;
            oldCost = row.cost;
            row.cost = newCost;
            found = true;
          }
        });
        if (found === true) {
          const writeStream = fs.createWriteStream("output.csv");
          fastcsv
            .writeToStream(writeStream, items, { headers: true })
            .on("finish", () => {
              responseMessage.message = "Cost updated successfully";
              responseMessage.book_name = book_name;

              res.json(
                `The cost of (${book_name}) book has been updated successfully, old cost: ${oldCost} , new cost : ${newCost}`
              );

              fs.renameSync("output.csv", "./catalog.csv");
            });
        } else {
          res.send("Item not found in the catalog");
        }
      });
  } catch (error) {
    res.status(500).send("Error reading the file");
  }
});

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
