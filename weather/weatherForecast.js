const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Replace with your OpenWeatherMap API key
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

router.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Missing location' });

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Extract relevant irrigation info: temp, rainfall, humidity
        const forecast = data.list.slice(0, 5).map(item => ({
            date: item.dt_txt,
            temp: item.main.temp,
            humidity: item.main.humidity,
            rainfall: item.rain ? item.rain['3h'] || 0 : 0
        }));
        res.json(forecast);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

module.exports = router;