import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  Paper,
  Box,
} from '@mui/material';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/books/${id}`);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
      navigate('/');
    }
  };

  const handleAddToCart = () => {
    if (book) {
      addToCart(book, quantity);
      navigate('/cart');
    }
  };

  if (!book) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <img
              src={`https://picsum.photos/seed/${book.id}/400/600`}
              alt={book.title}
              style={{ width: '100%', height: 'auto' }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              By {book.author}
            </Typography>
            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Genre: {book.genre}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                ${book.price.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Stock: {book.stock}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: book.stock }}
                sx={{ width: 100 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddToCart}
                disabled={book.stock === 0}
              >
                Add to Cart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default BookDetails; 