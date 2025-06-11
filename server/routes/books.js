const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');

import API_BASE_URL from "../config";
import axios from "axios";

const fetchBooks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/books`);
    // do something with response.data
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};


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

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  db.get('SELECT isAdmin FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  });
};

// Get all books
router.get('/', (req, res) => {
  const { genre, search } = req.query;
  let query = 'SELECT * FROM books';
  const params = [];

  if (genre) {
    query += ' WHERE genre = ?';
    params.push(genre);
  }

  if (search) {
    query += genre ? ' AND' : ' WHERE';
    query += ' (title LIKE ? OR author LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  db.all(query, params, (err, books) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching books' });
    }
    res.json(books);
  });
});

// Get single book
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM books WHERE id = ?', [req.params.id], (err, book) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching book' });
    }
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  });
});

// Add new book (admin only)
router.post('/', authenticateToken, isAdmin, (req, res) => {
  const { title, author, price, genre, description, stock } = req.body;

  db.run(
    'INSERT INTO books (title, author, price, genre, description, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [title, author, price, genre, description, stock],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error adding book' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update book (admin only)
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  const { title, author, price, genre, description, stock } = req.body;

  db.run(
    'UPDATE books SET title = ?, author = ?, price = ?, genre = ?, description = ?, stock = ? WHERE id = ?',
    [title, author, price, genre, description, stock, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating book' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json({ message: 'Book updated successfully' });
    }
  );
});

// Delete book (admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  db.run('DELETE FROM books WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting book' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  });
});

module.exports = router; 