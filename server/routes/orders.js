const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');

const db = new sqlite3.Database(path.join(__dirname, '../db.sqlite'));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Create new order
router.post('/', authenticateToken, (req, res) => {
  const { items, totalAmount } = req.body;
  const userId = req.user.id;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      'INSERT INTO orders (userId, totalAmount) VALUES (?, ?)',
      [userId, totalAmount],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ message: 'Error creating order' });
        }

        const orderId = this.lastID;
        let completed = 0;
        let hasError = false;

        items.forEach(item => {
          db.run(
            'INSERT INTO order_items (orderId, bookId, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.id, item.quantity, item.price],
            (err) => {
              if (err) {
                hasError = true;
              }
              completed++;

              if (completed === items.length) {
                if (hasError) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ message: 'Error creating order items' });
                }
                db.run('COMMIT');
                res.status(201).json({ orderId });
              }
            }
          );
        });
      }
    );
  });
});

// Get user's orders
router.get('/my-orders', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT o.*, 
     GROUP_CONCAT(oi.bookId || ',' || oi.quantity || ',' || oi.price) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.orderId
     WHERE o.userId = ?
     GROUP BY o.id
     ORDER BY o.createdAt DESC`,
    [userId],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching orders' });
      }

      // Format the items string into an array of objects
      orders = orders.map(order => ({
        ...order,
        items: order.items ? order.items.split(',').reduce((acc, curr, i, arr) => {
          if (i % 3 === 0) {
            acc.push({
              bookId: curr,
              quantity: arr[i + 1],
              price: arr[i + 2]
            });
          }
          return acc;
        }, []) : []
      }));

      res.json(orders);
    }
  );
});

// Get single order
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  db.get(
    `SELECT o.*, 
     GROUP_CONCAT(oi.bookId || ',' || oi.quantity || ',' || oi.price) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.orderId
     WHERE o.id = ? AND o.userId = ?
     GROUP BY o.id`,
    [orderId, userId],
    (err, order) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching order' });
      }
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Format the items string into an array of objects
      order.items = order.items ? order.items.split(',').reduce((acc, curr, i, arr) => {
        if (i % 3 === 0) {
          acc.push({
            bookId: curr,
            quantity: arr[i + 1],
            price: arr[i + 2]
          });
        }
        return acc;
      }, []) : [];

      res.json(order);
    }
  );
});

module.exports = router; 