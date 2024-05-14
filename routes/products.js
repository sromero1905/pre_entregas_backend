// routes/products.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PRODUCTS_FILE = path.join(__dirname, '../data/productos.json');

// Leer productos desde el archivo
async function readProductsFile() {
  try {
    const productsData = await fs.promises.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(productsData);
  } catch (error) {
    return [];
  }
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    let products = await readProductsFile();
    if (limit) {
      products = products.slice(0, limit);
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
