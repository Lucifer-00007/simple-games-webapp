const gamesContainer = document.getElementById('games-container');
const searchBar = document.getElementById('search-bar');

fetch('README.md')
    .then(response => response.text())
    .then(text => {
        const games = [];
        const lines = text.split('\n');
        const gameRegex = /\|\s*\d+\s*\|\s*\[([^\]]+)\]\(([^)]+)\)/;

        for (const line of lines) {
            const match = line.match(gameRegex);
            if (match) {
                const name = match[1];
                const path = match[2].split('/').slice(-2).join('/');
                games.push({ name, path });
            }
        }

        function displayGames(gamesToDisplay) {
            gamesContainer.innerHTML = '';
            gamesToDisplay.forEach(game => {
                const gameCard = document.createElement('div');
                gameCard.classList.add('game-card');

                const gameLink = document.createElement('a');
                gameLink.href = `${game.path}/index.html`;

                const gameName = document.createElement('h2');
                gameName.textContent = game.name;

                gameLink.appendChild(gameName);
                gameCard.appendChild(gameLink);
                gamesContainer.appendChild(gameCard);
            });
        }

        displayGames(games);

        searchBar.addEventListener('keyup', (e) => {
            const searchString = e.target.value.toLowerCase();
            const filteredGames = games.filter(game => {
                return game.name.toLowerCase().includes(searchString);
            });
            displayGames(filteredGames);
        });
    });