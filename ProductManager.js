const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async addProduct(product) {
        try {
            const products = await this.getProducts();
            product.id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
            products.push(product);
            await this.saveProducts(products);
            return product.id;
        } catch (error) {
            throw new Error('Error adding product: ' + error.message);
        }
    }

    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            } else {
                throw new Error('Error reading products: ' + error.message);
            }
        }
    }

    async getProductById(id) {
        try {
            const products = await this.getProducts();
            return products.find(product => product.id === id);
        } catch (error) {
            throw new Error('Error getting product by id: ' + error.message);
        }
    }

    async updateProduct(id, updatedFields) {
        try {
            const products = await this.getProducts();
            const index = products.findIndex(product => product.id === id);
            if (index !== -1) {
                products[index] = { ...products[index], ...updatedFields };
                await this.saveProducts(products);
                return true;
            } else {
                throw new Error('Product not found');
            }
        } catch (error) {
            throw new Error('Error updating product: ' + error.message);
        }
    }

    async deleteProduct(id) {
        try {
            let products = await this.getProducts();
            products = products.filter(product => product.id !== id);
            await this.saveProducts(products);
            return true;
        } catch (error) {
            throw new Error('Error deleting product: ' + error.message);
        }
    }

    async saveProducts(products) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        } catch (error) {
            throw new Error('Error saving products: ' + error.message);
        }
    }
}

module.exports = ProductManager;
