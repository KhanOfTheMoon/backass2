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

Server-side only:
- OpenWeather API key is stored in .env and used only on the server.
- The client does not call OpenWeather or Wikipedia directly.
- The client calls only /api/weather, so the API key is not exposed in the browser.

Assignment JSON fields
- temperature
- description
- coordinates
- feels_like
- wind_speed
- country_code
- rain_3h

Extra API (Fact API)
- Wikipedia REST API is used to provide a short fact/summary about the selected city.
- Runs strictly on the server to meet the “Server-Side Only” requirement.
