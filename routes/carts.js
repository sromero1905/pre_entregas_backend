
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const CARTS_FILE = path.join(__dirname, '../data/carrito.json');


async function readCartsFile() {
  try {
    const cartsData = await fs.promises.readFile(CARTS_FILE, 'utf-8');
    return JSON.parse(cartsData);
  } catch (error) {
    return [];
  }
}


async function writeCartsFile(carts) {
  try {
    await fs.promises.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
  } catch (error) {
    throw new Error('Error saving carts: ' + error.message);
  }
}


async function generateUniqueId() {
  const carts = await readCartsFile();
  let newId;
  do {
    newId = Math.random().toString(36).substr(2, 9);
  } while (carts.some(cart => cart.id === newId));
  return newId;
}

// POST /api/carts
router.post('/', async (req, res) => {
  try {
    const newCart = {
      id: await generateUniqueId(),
      products: []
    };
    const carts = await readCartsFile();
    carts.push(newCart);
    await writeCartsFile(carts);
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
  try {
    const carts = await readCartsFile();
    const cart = carts.find(cart => cart.id === req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const carts = await readCartsFile();
    const cartIndex = carts.findIndex(cart => cart.id === cid);
    if (cartIndex === -1) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(item => item.id === pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity++;
    } else {
      cart.products.push({ id: pid, quantity: 1 });
    }
    await writeCartsFile(carts);
    res.status(201).json(cart.products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
