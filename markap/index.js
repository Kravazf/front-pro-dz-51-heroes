// URL до API
const API = 'https://64e4e423c55563802913e735.mockapi.io/apa/v1/';

// Отримання часто використовуваних DOM-елементів
const buttonAddHero = document.querySelector('#add-hero');
const heroesForm = document.getElementById('heroesForm');
const heroesTableBody = document.querySelector('.heroes__table tbody');

// Функція для взаємодії з API
async function controller(action, method, body) {
  const URL = `${API}${action}`;

  const params = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) params.body = JSON.stringify(body);

  try {
    const response = await fetch(URL, params);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

// Отримати список героїв з сервера
async function getHeroesFromServer() {
  try {
    const heroes = await controller('heroes', 'GET');
    return heroes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Функція для додавання героя на сервер
async function addHeroToServer(heroData) {
  try {
    const result = await controller('heroes', 'POST', heroData);
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Функція для перевірки наявності героя з заданим ім'ям
async function isHeroNameTaken(heroName) {
  const heroesList = await getHeroesFromServer();
  return heroesList.some(hero => hero.name === heroName);
}

// Функція для видалення героя з сервера за ідентифікатором
async function deleteHeroFromServer(heroId) {
  try {
    await controller(`heroes/${heroId}`, 'DELETE');
  } catch (error) {
    console.log(error);
  }
}

// Функція для відображення героя у таблиці
function renderHeroRow(hero) {
  const heroesTableBody = document.querySelector('.heroes__table tbody');
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>${hero.name}</td>
    <td>${hero.comics}</td>
    <td>
      <label class="heroFavouriteInput">
        Favourite: <input type="checkbox" ${hero.favourite ? 'checked' : ''}>
      </label>
    </td>
    <td>
      <button class="delete-button" data-id="${hero.id}">Delete</button>
    </td>
  `;
  heroesTableBody.appendChild(newRow);
}

// Обробник події натискання на кнопку "Додати героя"
buttonAddHero.addEventListener('click', async () => {
  const heroName = heroesForm.querySelector('[data-name="heroName"]').value;
  const heroComics = heroesForm.querySelector('[data-name="heroComics"]').value;
  const heroFavourite = heroesForm.querySelector('[data-name="heroFavourite"]').checked;

  const heroData = {
    name: heroName,
    comics: heroComics,
    favourite: heroFavourite,
  };

  // Перевірити, чи існує герой з таким же ім'ям
  const isTaken = await isHeroNameTaken(heroName);

  if (isTaken) {
    console.log(`Герой з ім'ям "${heroName}" вже існує`);
  } else {
    // Додати героя до бази даних
    const result = await addHeroToServer(heroData);

    if (result) {
      // Відображення героя у таблиці
      renderHeroRow(result);

      // Очищення полів вводу форми
      heroesForm.reset();
    }
  }
});

// Функція для оновлення статусу "Вибране" на сервері
async function updateHeroFavouriteOnServer(heroId, isFavourite) {
  const heroData = {
    favourite: isFavourite,
  };

  try {
    await controller(`heroes/${heroId}`, 'PUT', heroData);
  } catch (error) {
    console.log(error);
  }
}

// Обробник події зміни стану чекбокса в таблиці
heroesTableBody.addEventListener('change', async (event) => {
  if (event.target.type === 'checkbox') {
    const checkbox = event.target;
    const row = checkbox.closest('tr');
    const heroId = row.querySelector('.delete-button').getAttribute('data-id');
    const heroFavourite = checkbox.checked;

    // Оновити статус "Вибране" на сервері
    await updateHeroFavouriteOnServer(heroId, heroFavourite);
  }
});

async function deleteHeroAndRow(heroId, row) {
  // Видалити героя з сервера
  await deleteHeroFromServer(heroId);

  // Видалити рядок з таблиці
  row.remove();
}

heroesTableBody.addEventListener('click', async (event) => {
  if (event.target.classList.contains('delete-button')) {
    const button = event.target;
    const row = button.closest('tr');
    const heroId = button.getAttribute('data-id');

    // Видалити героя та рядок з таблиці
    await deleteHeroAndRow(heroId, row);
  }
});


