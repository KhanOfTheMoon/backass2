const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();

app.use(express.static('public'));

const KEY = process.env.OPENWEATHER_API_KEY;

// Определяем язык википедии по вводу
function wikiLangFromText(text) {
  return /[А-Яа-яЁё]/.test(text) ? 'ru' : 'en';
}

// Название страны по коду без дополнительных API
function countryNameFromCode(code, lang = 'en') {
  try {
    const dn = new Intl.DisplayNames([lang], { type: 'region' });
    return dn.of(code) || code;
  } catch {
    return code;
  }
}

// Получаем summary из Wikipedia REST API: /page/summary/{title}
async function fetchWikiFact(title) {
  const lang = wikiLangFromText(title);
  const base = lang === 'ru' ? 'https://ru.wikipedia.org' : 'https://en.wikipedia.org';
  const url = `${base}/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

  const { data } = await axios.get(url, {
    timeout: 8000,
    headers: {
      // Wikimedia просит указывать User-Agent (уникальный/понятный)
      'User-Agent': 'weather-simple-3000/1.0 (student-project)'
    }
  });

  return {
    source: 'wikipedia',
    title: data.title || title,
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

    // Основной JSON по требованиям
    const weather = {
      temperature: data.main.temp,
      description: data.weather?.[0]?.description || '',
      coordinates: { lat: data.coord.lat, lon: data.coord.lon },
      feels_like: data.main.feels_like,
      wind_speed: data.wind.speed,
      country_code: data.sys.country,
      rain_3h: typeof data?.rain?.['3h'] === 'number' ? data.rain['3h'] : 0
    };

    // Fact API
    let factObj = null;
    try {
      factObj = await fetchWikiFact(city);
    } catch {
      try {
        const lang = wikiLangFromText(city);
        const countryName = countryNameFromCode(weather.country_code, lang);
        factObj = await fetchWikiFact(countryName);
      } catch {
        factObj = null;
      }
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
