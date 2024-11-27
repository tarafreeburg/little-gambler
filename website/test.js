const fixturesUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&next=15';
const apiOptions = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': '921908905cmshac2cc1ffdff44bbp18a0d4jsnc0818ea7d38f',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    }
};

// Fetch and display fixtures along with odds
async function fetchAndDisplayData() {
    try {
        const response = await fetch(fixturesUrl, apiOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse the response
        displayData(data); // Display fixture data
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Display fixtures and fetch/display odds for each
async function displayData(data) {
    const container = document.getElementById("data-container");
    container.innerHTML = ""; // Clear previous content

    // Loop through the fixtures
    for (const match of data.response) {
        // Extract fixture details
        const date = new Date(match.fixture.date).toLocaleString(); // Format date
        const fixtureID = match.fixture.id;
        const homeTeam = match.teams.home.name;
        const awayTeam = match.teams.away.name;

        // Create an HTML element for the match
        const matchElement = document.createElement("div");
        matchElement.classList.add("match"); // Optional: For styling
        matchElement.innerHTML = `
            <p>${date}</p>
            <p><strong>${homeTeam}</strong> vs <strong>${awayTeam}</strong></p>
            <div class="odds" id="odds-${fixtureID}">Loading odds...</div>
            <hr>
        `;

        // Add the match element to the container
        container.appendChild(matchElement);

        // Fetch and display odds for this fixture
        await fetchOdds(fixtureID, `odds-${fixtureID}`);
    }
}

// Fetch odds for a specific fixture and update the DOM
async function fetchOdds(fixtureId, elementId) {
    const oddsUrl = `https://api-football-v1.p.rapidapi.com/v3/odds?fixture=${fixtureId}&league=39&season=2024`;

    try {
        const response = await fetch(oddsUrl, apiOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const oddsData = await response.json();

        // Extract and display odds (modify this as needed based on API structure)
        const oddsElement = document.getElementById(elementId);
        const bookmaker = oddsData.response[0]?.bookmakers[0]?.name || "No data";
        const odds = oddsData.response[0]?.bookmakers[0]?.bets[0]?.values || [];

        // Format the odds into a readable format
        if (odds.length > 0) {
            const formattedOdds = odds.map(
                (odd) => `<p>${odd.value}: ${odd.odd}</p>`
            ).join("");
            oddsElement.innerHTML = `${formattedOdds}`;
        } else {
            oddsElement.innerHTML = "Odds not available.";
        }
    } catch (error) {
        console.error("Error fetching odds:", error);
        document.getElementById(elementId).innerHTML = "Error fetching odds.";
    }
}

// Fetch and display data when the page loads
fetchAndDisplayData();
