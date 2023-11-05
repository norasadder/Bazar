const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000; 

app.get('/purchase/:item_number', async (req, res) => {
    try {
      const itemToPurchase = req.params.item_number;
  
      const catalogServerUrl = 'http://localhost:4000';
  
      // Use Axios to make a GET request to check item availability
      const queryResponse = await axios.get(`${catalogServerUrl}/query/${itemToPurchase}`);
  
      if (queryResponse.status === 200) {
  
        if (Array.isArray(queryResponse.data) && queryResponse.data.length > 0) {
          // Item found in the catalog, proceed with the purchase logic
          // Update the stock by making another request
          const updateResponse = await axios.get(`${catalogServerUrl}/update/${itemToPurchase}`);
  
          if (updateResponse.status === 200) {
            // Successfully updated stock in the catalog server
  
            if (updateResponse.data.message === 'No stock. Sold out.') {
              // If the catalog server responds with "No stock. Sold out.", handle the out-of-stock case
              res.status(400).json({ error: 'Item is out of stock' });
            } else if (updateResponse.data.message === 'Stock updated successfully') {
              // The catalog server has successfully updated the stock, proceed with the purchase logic
  
              // Respond with a success message
              res.json({ message: 'Item purchased successfully' });
            } else {
              // Handle other responses if needed
              res.status(500).json({ error: 'Unexpected response from catalog server' });
            }
          } else {
            // Handle other HTTP status codes if needed
            res.status(500).json({ error: 'Unexpected response from catalog server' });
          }
        } else {
          // Handle the case when the catalog server responds with "No results found."
          res.status(404).json({ error: 'Item not found in the catalog' });
        }
      } else {
        // Handle other HTTP status codes if needed
        res.status(500).json({ error: 'Unexpected response from catalog server' });
      }
    } catch (error) {
      // Handle any errors that occur during the purchase process
      console.error(error);
      res.status(500).json({ error: 'Error processing the purchase' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Express server is running on port ${port}`);
  });
