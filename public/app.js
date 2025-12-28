const cityEl = document.getElementById("city");
const btn = document.getElementById("btn");
const out = document.getElementById("out");

btn.onclick = async () => {
  const city = cityEl.value.trim();
  if (!city) return (out.textContent = "Write a city name.");

  out.textContent = "Loading...";

  try {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    // FACT
    const fact = data.fact?.fact ? data.fact.fact : "No fact found.";
    const link = data.fact?.url ? `\nsource: ${data.fact.url}` : "";

    // CURRENCY
    const cur = data.currency;
    let currencyText = "currency: not available";

    if (cur) {
      const usdTo = cur.usd_to_currency !== null ? cur.usd_to_currency : "N/A";
      const toUsd =
        cur.currency_to_usd !== null ? Number(cur.currency_to_usd).toFixed(4) : "N/A";

      currencyText =
`currency: ${cur.currency_code} (${cur.currency_name})
symbol: ${cur.currency_symbol || "-"}
1 USD = ${usdTo} ${cur.currency_code}
1 ${cur.currency_code} = ${toUsd} USD`;
    }

    // OUTPUT (один раз, одной строкой)
    out.textContent =
`temperature: ${data.temperature} °C
feels_like: ${data.feels_like} °C
description: ${data.description}
coordinates: ${data.coordinates.lat}, ${data.coordinates.lon}
wind_speed: ${data.wind_speed} m/s
country_code: ${data.country_code}
rain_3h: ${data.rain_3h} mm

fact: ${fact}${link}

${currencyText}`;
  } catch (e) {
    out.textContent = "Error: " + e.message;
  }
};
