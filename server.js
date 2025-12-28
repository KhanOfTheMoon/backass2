const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();

app.use(express.static('public'));

const KEY = process.env.OPENWEATHER_API_KEY;

// если кириллица ru, иначе en
function wikiLangFromText(text) {
  return /[А-Яа-яЁё]/.test(text) ? 'ru' : 'en';
}

async function fetchWikiFact(city) {
  const lang = wikiLangFromText(city);
  const base = lang === 'ru' ? 'https://ru.wikipedia.org' : 'https://en.wikipedia.org';
  const url = `${base}/api/rest_v1/page/summary/${encodeURIComponent(city)}`;

  const { data } = await axios.get(url, {
    timeout: 8000,
    headers: { 'User-Agent': 'weather-app/1.0 (student-project)' }
  });

  return {
    source: 'wikipedia',
    title: data.title || city,
    fact: data.extract || '',
    url: data?.content_urls?.desktop?.page || ''
  };
}

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api/weather', async (req, res) => {
  try {
    const city = (req.query.city || '').trim();
    if (!city) return res.status(400).json({ error: 'city is required' });
    if (!KEY) return res.status(500).json({ error: 'OPENWEATHER_API_KEY missing in .env' });

    const owUrl =
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}` +
      `&appid=${encodeURIComponent(KEY)}&units=metric`;

    const { data } = await axios.get(owUrl, { timeout: 8000 });

    const weather = {
      temperature: data.main.temp,
      description: data.weather?.[0]?.description || '',
      coordinates: { lat: data.coord.lat, lon: data.coord.lon },
      feels_like: data.main.feels_like,
      wind_speed: data.wind.speed,
      country_code: data.sys.country,
      rain_3h: typeof data?.rain?.['3h'] === 'number' ? data.rain['3h'] : 0
    };

    let factObj = null;
    try {
      factObj = await fetchWikiFact(city);
    } catch {
      factObj = null;
    }

    res.json({ ...weather, fact: factObj });
  } catch (e) {
    const status = e?.response?.status || 500;
    const msg = e?.response?.data?.message || e.message || 'error';
    res.status(status).json({ error: msg });
  }
});

app.listen(3000, () => {
  console.log(`Server started: http://localhost:3000`);
});
