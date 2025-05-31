// Menu elements
const mainMenu = document.getElementById('main-menu');
const subMenuPractica = document.getElementById('sub-menu-practica');
const appContainer = document.getElementById('app-container');

// Buttons
const practiceButton = document.getElementById('practice-button');
const practice1v1Button = document.getElementById('practice-1v1-button');
const practice2v2Button = document.getElementById('practice-2v2-button');
const backToMainMenuButton = document.getElementById('back-to-main-menu-from-submenu-button');
const backToMenuButton = document.getElementById('back-to-menu-button');

// Menu navigation
practiceButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    subMenuPractica.style.display = 'block';
});

backToMainMenuButton.addEventListener('click', () => {
    subMenuPractica.style.display = 'none';
    mainMenu.style.display = 'block';
});

// Game mode selection
practice1v1Button.addEventListener('click', () => {
    subMenuPractica.style.display = 'none';
    appContainer.style.display = 'block';
    // Aquí inicializaremos el juego en modo 1v1
});

practice2v2Button.addEventListener('click', () => {
    subMenuPractica.style.display = 'none';
    appContainer.style.display = 'block';
    // Aquí inicializaremos el juego en modo 2v2
});

backToMenuButton.addEventListener('click', () => {
    appContainer.style.display = 'none';
    mainMenu.style.display = 'block';
});

// Contraste toggle functionality
const contrasteToggleButton = document.getElementById('contraste-toggle-button');
const contrasteIconContainer = document.getElementById('contraste-icon-container');

contrasteToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('contraste-alto');
    contrasteIconContainer.textContent = document.body.classList.contains('contraste-alto') ? '🌙' : '☀️';
});