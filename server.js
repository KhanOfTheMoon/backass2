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

// 1) берём валюту страны по ISO-коду (KZ -> KZT) через RestCountries
async function fetchCurrencyCodeByCountry(countryCode) {
  const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(countryCode)}?fields=currencies,name,cca2`;

  const { data } = await axios.get(url, { timeout: 8000 });

  const obj = Array.isArray(data) ? data[0] : data;
  const currencies = obj?.currencies || {};
  const currencyCode = Object.keys(currencies)[0] || null;

  if (!currencyCode) return null;

  return {
    country_name: obj?.name?.common || countryCode,
    currency_code: currencyCode,
    currency_name: currencies[currencyCode]?.name || '',
    currency_symbol: currencies[currencyCode]?.symbol || ''
  };
}

// 2) берём курсы (без ключа) и считаем конвертацию
async function fetchUsdRates() {
  const url = 'https://open.er-api.com/v6/latest/USD';
  const { data } = await axios.get(url, { timeout: 8000 });

  // на всякий случай проверка формата
  if (data?.result && data.result !== 'success') {
    throw new Error('Currency rates API error');
  }

  return data?.rates || {};
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

    // Fact API (Wikipedia)
    let factObj = null;
    try {
      factObj = await fetchWikiFact(city);
    } catch {
      factObj = null;
    }

    // Currency API (RestCountries + ExchangeRate-API open.er-api.com)
    let currencyObj = null;
    try {
      const cInfo = await fetchCurrencyCodeByCountry(weather.country_code);
      if (cInfo?.currency_code) {
        const rates = await fetchUsdRates();
        const rate = rates[cInfo.currency_code];

        currencyObj = {
          ...cInfo,
          usd_to_currency: typeof rate === 'number' ? rate : null,
          currency_to_usd: typeof rate === 'number' ? (1 / rate) : null
        };
      }
    } catch {
      currencyObj = null;
    }

    res.json({ ...weather, fact: factObj, currency: currencyObj });
  } catch (e) {
    const status = e?.response?.status || 500;
    const msg = e?.response?.data?.message || e.message || 'error';
    res.status(status).json({ error: msg });
  }
});

app.listen(3000, () => {
  console.log(`Server started: http://localhost:3000`);
});
