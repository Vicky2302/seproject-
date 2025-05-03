
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const TMDB_API_KEY = 'efd5019501b9d04fd8887fc2acfe9a12';

app.use(cors());
app.use(express.json());

const genreMap = {
  'Action': '28',
  'Comedy': '35',
  'Drama': '18',
  'Romance': '10749',
  'Thriller': '53',
  'Horror': '27'
};

app.get('/api/movies', async (req, res) => {
  try {
    const { decade, language, popularity, genres } = req.query;

    let tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

    if (decade) {
      const startYear = parseInt(decade.slice(0, 4));
      const endYear = startYear + 9;
      tmdbUrl += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
    }

    if (language) {
      tmdbUrl += `&with_original_language=${language.toLowerCase()}`;
    }

    if (popularity === 'high') {
      tmdbUrl += `&vote_count.gte=10000`;
    }

    if (genres) {
      const genreIds = genres.split(',').map(g => genreMap[g.trim()] || '').filter(Boolean);
      if (genreIds.length > 0) {
        tmdbUrl += `&with_genres=${genreIds.join(',')}`;
      }
    }

    const response = await axios.get(tmdbUrl);

    const movies = response.data.results.map(movie => ({
      name: movie.title,
      year: movie.release_date?.split('-')[0] || 'N/A',
      genre: genres || 'N/A',
      language: movie.original_language,
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : ''
    }));

    res.json(movies);
  } catch (error) {
    console.error('Error fetching from TMDB:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies from TMDB' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});
