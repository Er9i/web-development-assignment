import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import axios from 'axios';

const genres = [
  'All',
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Biography',
];

function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, [search, selectedGenre]);

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedGenre !== 'All') params.append('genre', selectedGenre);

      const response = await axios.get(`http://localhost:5000/api/books?${params}`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search books"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {genres.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        {books.map((book) => (
          <Grid item key={book.id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/book/${book.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={`https://picsum.photos/seed/${book.id}/200/300`}
                alt={book.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {book.title}
                </Typography>
                <Typography color="text.secondary">
                  By {book.author}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {book.genre}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  ${book.price.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home; 