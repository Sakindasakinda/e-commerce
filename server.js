const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Konfigurasi koneksi database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecommerce_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Endpoint untuk mendapatkan semua produk
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

// Endpoint untuk mendapatkan detail produk
app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM products WHERE product_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results[0]);
    });
});

// Endpoint untuk membuat pesanan baru
app.post('/orders', (req, res) => {
    const { user_id, items } = req.body;
    const total_amount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const orderQuery = 'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)';
    db.query(orderQuery, [user_id, total_amount], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        const order_id = result.insertId;
        const orderItemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
        const orderItemsData = items.map(item => [order_id, item.product_id, item.quantity, item.price]);

        db.query(orderItemsQuery, [orderItemsData], (err) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(201).send({ order_id });
        });
    });
});

// Jalankan server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
