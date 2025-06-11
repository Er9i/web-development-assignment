import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Box,
  TextField,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/orders', {
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: getTotal(),
      });
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  if (cart.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <CardMedia
                      component="img"
                      height="100"
                      image={`https://picsum.photos/seed/${item.id}/100/150`}
                      alt={item.title}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography color="text.secondary">
                      By {item.author}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                      inputProps={{ min: 1 }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h6">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      color="error"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body1">
                  Total Items: {cart.length}
                </Typography>
                <Typography variant="h5" sx={{ mt: 2 }}>
                  Total: ${getTotal().toFixed(2)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCheckout}
              >
                {user ? 'Checkout' : 'Login to Checkout'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Cart; 