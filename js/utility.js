const getRandomInt = function(max, min) {
  return Math.floor(Math.random() * (max-min) + min);
}

function getRandomVal(max, min) {
  return Math.random() * (max-min) + min;
}

const elementInList = function(target, elements) {
  for(let element of elements) {
    if(element === target) return true;
  }
  return false;
}
document.addEventListener('DOMContentLoaded', function() {
  let theme = localStorage.getItem('theme');
  if(!theme) return;
  if(theme == 'dark') {
    toggleDarkMode();
  }
  if(theme == 'light') {
    toggleLightMode();
  }
});
const toggleLightMode = function(event) {
  if(event) event.stopPropagation();
  const root = document.querySelector(":root");
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');
  lightIcon.classList.add('hide');
  darkIcon.classList.remove('hide');
  localStorage.setItem('theme', 'light');
  root.classList.add('light');
  root.classList.remove('dark');
}

const toggleDarkMode = function(event) {
  if(event) event.stopPropagation();
  const root = document.querySelector(":root");
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');
  localStorage.setItem('theme', 'dark');
  darkIcon.classList.add('hide');
  lightIcon.classList.remove('hide');
  root.classList.add('dark');
  root.classList.remove('light');
}

const sleep = ms => new Promise(r => setTimeout(r, ms));