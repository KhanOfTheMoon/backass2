Student: Aibek Nurtay
Group: SE-2433
Subject: Web Tech 2

## Screenshot of website:
<img width="1136" height="692" alt="image" src="https://github.com/user-attachments/assets/54d496ab-cc40-46bf-b778-e2984caa85d4" />
<img width="1909" height="1037" alt="image" src="https://github.com/user-attachments/assets/d197baf2-84ee-47db-b5ed-c14059552ca8" />

## Setup Instructions

1) Install dependencies:
~~~
npm install
~~~
2) Create a file named `.env` in the project root and add your OpenWeather key:
~~~
OPENWEATHER_API_KEY=YOUR_KEY_HERE
~~~
3) Start the server:
~~~
node server.js
~~~
4) Open the website:
- http://localhost:3000

## API Usage Details

### GET /api/weather?city=CityName

Example:
- GET http://localhost:3000/api/weather?city=Astana
<img width="2560" height="485" alt="image" src="https://github.com/user-attachments/assets/20312281-22b6-4a13-aaee-073c6945eb70" />

Response (example format):

~~~json
{
  "temperature": 0,
  "description": "clear sky",
  "coordinates": { "lat": 0, "lon": 0 },
  "feels_like": 0,
  "wind_speed": 0,
  "country_code": "KZ",
  "rain_3h": 0,
  "fact": {
    "source": "wikipedia",
    "title": "Astana",
    "fact": "Short summary text...",
    "url": "https://en.wikipedia.org/wiki/Astana"
  }
}
~~~

## Key Design Decisions

### Server-side only
- OpenWeather API key is stored in `.env` and used only on the server.
- The frontend does not call OpenWeather/Wikipedia/Currency APIs directly.
- The frontend calls only `/api/weather`, so API keys are not exposed in the browser.

### Assignment JSON fields
The server returns the required weather fields:
- temperature
- description
- coordinates
- feels_like
- wind_speed
- country_code
- rain_3h

### Integration of two additional server-side APIs

1) Fact API (Wikipedia REST)
- The server requests a short city summary using Wikipedia REST API.
- The fact is included in the JSON response as `fact` and displayed on the website.

2) Currency APIs (RestCountries + Exchange Rates)
- The server detects the country using OpenWeather `country_code`.
- RestCountries is used to map the country code to the local currency (example: `KZ -> KZT`).
- Exchange Rates API is used to get rates based on USD and compute:
  - `usd_to_currency` (1 USD -> local currency)
  - `currency_to_usd` (1 local currency -> USD)
- The currency block is included in the JSON response as `currency` and displayed on the website.
