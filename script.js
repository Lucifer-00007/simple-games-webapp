document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('games-container');
    const searchBar = document.getElementById('search-bar');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const html = document.documentElement;

    // Function to set the theme
    function setTheme(theme) {
        // Set the data-theme attribute on the html element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Save the theme preference
        localStorage.setItem('theme', theme);
        
        // Update the UI to reflect the current theme
        updateThemeUI(theme);
    }

    // Update UI elements based on the current theme
    function updateThemeUI(theme) {
        if (theme === 'light') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Load theme from local storage or system preference
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        setTheme(theme);
    }

    // Initialize theme
    loadTheme();

    // Theme toggle event listener with animation
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Add transition class for smooth theme change
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // Button press animation
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1.1)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 50);
        }, 50);
        
        // Set the new theme
        setTheme(newTheme);
        
        // Remove transition after animation completes
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    });

    // Show loading state
    gamesContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading games...</p>
        </div>
    `;

    // Sample game data with categories and descriptions
    const gameCategories = {
        'Puzzle': ['Candy Crush', 'Minesweeper', '2048'],
        'Action': ['Archery', 'Breakout', 'Ping Pong'],
        'Classic': ['Tetris', 'Snake', 'Tic Tac Toe'],
        'Arcade': ['Flappy Bird', 'Fruit Slicer', 'Whack A Mole']
    };

    // Get a random category for a game
    function getGameCategory(gameName) {
        for (const [category, games] of Object.entries(gameCategories)) {
            if (games.some(g => gameName.includes(g))) {
                return category;
            }
        }
        return 'Other';
    }

    // Sample descriptions for games
    const gameDescriptions = {
        'Candy Crush': 'Match colorful candies in this addictive puzzle game.',
        'Archery': 'Test your aim and precision in this archery challenge.',
        'Speed Typing': 'Improve your typing speed with this fun game.',
        'Breakout': 'Break all the bricks with your paddle and ball!',
        'Minesweeper': 'Find all the mines without detonating them.',
        'Tower Blocks': 'Stack blocks as high as you can!',
        'Ping Pong': 'Classic Pong game with smooth controls.',
        'Tetris': 'The timeless tile-matching puzzle game.',
        'Snake': 'Grow your snake as long as possible.',
        'Tic Tac Toe': 'The classic noughts and crosses game.'
    };

    // Default description
    const defaultDescription = 'A fun and interactive game to enjoy in your browser.';

    fetch('README.md')
        .then(response => response.text())
        .then(text => {
            const games = [];
            const lines = text.split('\n');
            const gameRegex = /\|\s*\d+\s*\|\s*\[([^\]]+)\]\(([^)]+)\)/;

            for (const line of lines) {
                const match = line.match(gameRegex);
                if (match && match[1] && match[2]) {
                    const name = match[1].replace('Game', '').trim();
                    const path = match[2];
                    const category = getGameCategory(name);
                    const description = gameDescriptions[name] || defaultDescription;
                    
                    games.push({ 
                        name, 
                        path, 
                        category,
                        description,
                        // Add a random number of stars (3-5)
                        rating: (Math.random() * 2 + 3).toFixed(1)
                    });
                }
            }

            function displayGames(gamesToDisplay) {
                if (gamesToDisplay.length === 0) {
                    gamesContainer.innerHTML = `
                        <div class="no-results">
                            <i class="fas fa-gamepad"></i>
                            <h3>No games found</h3>
                            <p>Try adjusting your search or check back later for new additions!</p>
                        </div>
                    `;
                    return;
                }

                gamesContainer.innerHTML = gamesToDisplay.map(game => `
                    <div class="game-card" data-category="${game.category.toLowerCase()}">
                        <a href="${game.path}" target="_blank" aria-label="Play ${game.name}">
                            <div class="game-thumbnail">
                                <i class="fas fa-gamepad"></i>
                                <span class="game-tag">${game.category}</span>
                            </div>
                            <div class="card-content">
                                <h2>${game.name}</h2>
                                <p class="game-description">${game.description}</p>
                                <div class="game-meta">
                                    <span class="rating">
                                        <i class="fas fa-star"></i> ${game.rating}
                                    </span>
                                    <span class="play-now">
                                        Play Now <i class="fas fa-arrow-right"></i>
                                    </span>
                                </div>
                            </div>
                        </a>
                    </div>
                `).join('');

                // Add animation to game cards
                const cards = document.querySelectorAll('.game-card');
                cards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = `opacity 0.3s ease ${index * 0.05}s, transform 0.3s ease ${index * 0.05}s`;
                    
                    // Trigger reflow
                    void card.offsetWidth;
                    
                    // Animate in
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }

            displayGames(games);

            // Debounce search input
            let searchTimeout;
            searchBar.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const searchString = e.target.value.trim().toLowerCase();
                
                // Show loading state for better UX
                if (searchString.length > 0) {
                    gamesContainer.innerHTML = `
                        <div class="loading">
                            <div class="loading-spinner"></div>
                            <p>Searching games...</p>
                        </div>
                    `;
                }
                
                searchTimeout = setTimeout(() => {
                    const filteredGames = games.filter(game => 
                        game.name.toLowerCase().includes(searchString) ||
                        game.description.toLowerCase().includes(searchString) ||
                        game.category.toLowerCase().includes(searchString)
                    );
                    displayGames(filteredGames);
                }, 300);
            });

            // Add smooth scroll to top when searching
            searchBar.addEventListener('focus', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        })
        .catch(error => {
            console.error('Error loading games:', error);
            gamesContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>We couldn't load the games. Please try again later.</p>
                    <button id="retry-button" class="btn">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            `;
            
            document.getElementById('retry-button')?.addEventListener('click', () => {
                window.location.reload();
            });
        });
});