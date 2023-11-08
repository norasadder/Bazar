const express = require("express");
const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");
const fastcsv = require("fast-csv");

const app = express();
const port = 3000;

// make an order
// will check the item first then the stock
// if no error the stock will be decrement and the purchase will be stored
app.get("/purchase/:item_number", async (req, res) => {
  try {
    const itemToPurchase = req.params.item_number;

    const catalogServerUrl = "http://catalog:3000";

    // Use Axios to make a GET request to check item availability
    const queryResponse = await axios.get(
      `${catalogServerUrl}/query/itemNumber/${itemToPurchase}`
    );

    if (queryResponse.status === 200) {
      if (Array.isArray(queryResponse.data) && queryResponse.data.length > 0) {
        // Item found in the catalog, proceed with the purchase logic
        // Update the stock by making another request
        const updateResponse = await axios.get(
          `${catalogServerUrl}/update/decrement/${itemToPurchase}`
        );

        if (updateResponse.status === 200) {
          // Successfully updated stock in the catalog server
          if (updateResponse.data.message === "No stock. Sold out.") {
            // If the catalog server responds with "No stock. Sold out.", handle the out-of-stock case
            res.json(
              `The book (${updateResponse.data.book_name}) is out of stock`
            );
          } else if (
            updateResponse.data.message === "Stock updated successfully"
          ) {
            // The catalog server has successfully updated the stock, proceed with the purchase logic
            // Respond with a success message
            await addOrder(itemToPurchase);
            res.json(
              `The book (${updateResponse.data.book_name}) has been bought successfully`
            );
          } else if (
            updateResponse.data.message === "Item not found in the catalog"
          ) {
            res.json(
              `The book with number (${itemToPurchase}) is not found in the catalog`
            );
          } else {
            // Handle other responses if needed
            res
              .status(500)
              .json({ error: "Unexpected response from catalog server" });
          }
        } else {
          // Handle other HTTP status codes if needed
          res
            .status(500)
            .json({ error: "Unexpected response from catalog server" });
        }
      } else {
        // Handle the case when the catalog server responds with "No results found."
        res.json(
          `The book with number (${itemToPurchase}) is not found in the catalog`
        );
      }
    } else {
      // Handle other HTTP status codes if needed
      res
        .status(500)
        .json({ error: "Unexpected response from catalog server" });
    }
  } catch (error) {
    // Handle any errors that occur during the purchase process
    console.error(error);
    res.status(500).json({ error: "Error processing the purchase" });
  }
});

async function addOrder(item_number) {
  try {
    const items = [];
    let order_number = 0;
    await fs
      .createReadStream("./order.csv")
      .pipe(csv())
      .on("data", (row) => {
        items.push(row);
        order_number += 1;
      })
      .on("end", () => {
        console.log(items);
        items.push({ order_number: order_number, item_number: item_number });
        console.log(items);
        const writeStream = fs.createWriteStream("output.csv");

        fastcsv
          .writeToStream(writeStream, items, { headers: true })
          .on("finish", () => {
            console.log("Data has been updated and written to output.csv");
          });

        fs.renameSync("output.csv", "./order.csv");
      });
  } catch (error) {
    console.log("Error reading the file");
  }
}

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
