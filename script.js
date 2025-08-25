document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('games-container');
    const searchBar = document.getElementById('search-bar');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // Function to set the theme
    function setTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            document.body.classList.remove('light-theme');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
        localStorage.setItem('theme', theme);
    }

    // Load theme from local storage
    const currentTheme = localStorage.getItem('theme') || 'dark';
    setTheme(currentTheme);

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
        setTheme(newTheme);
    });

    fetch('README.md')
        .then(response => response.text())
        .then(text => {
            const games = [];
            const lines = text.split('\n');
            const gameRegex = /|\s*\d+\s*|\s*\[([^\]]+)\]\(([^)]+)\)/;

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

                    const thumbnail = document.createElement('div');
                    thumbnail.classList.add('game-thumbnail');
                    thumbnail.textContent = game.name.charAt(0);

                    const cardContent = document.createElement('div');
                    cardContent.classList.add('card-content');

                    const gameName = document.createElement('h2');
                    gameName.textContent = game.name;

                    cardContent.appendChild(gameName);
                    gameLink.appendChild(thumbnail);
                    gameLink.appendChild(cardContent);
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
});
