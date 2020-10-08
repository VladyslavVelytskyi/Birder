/* root component starts here */
require('assets/less/main.less'); // include general styles

const menuButton = document.getElementById('menu-button');

const header = document.getElementById('header');

menuButton.addEventListener('click', e => {
  header.classList.toggle('header--open');
});

const enterScreen = document.getElementById('enter');

enterScreen.addEventListener('click', () => {
  enterScreen.classList.add('enter--action');
  header.classList.remove('header--hidden');
  

  setTimeout(() => {
    header.classList.add('header--visible');
    enterScreen.style.display = 'none';
  }, 500);
});