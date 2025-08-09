/* === КОНФИГУРАЦИЯ СТИЛЕЙ И ШРИФТОВ === */
// Подключение фирменного шрифта YS Display
import './fonts/ys-display/fonts.css';
// Основные стили интерфейса таблицы
import './style.css';

/* === ИМПОРТ ИСХОДНЫХ ДАННЫХ === */
import {data as sourceData} from "./data/dataset_1.js";

/* === ИМПОРТ СЕРВИСНЫХ МОДУЛЕЙ === */
// Модуль управления состоянием данных
import {initData} from "./data.js";
// Утилиты для обработки данных форм
import {processFormData} from "./lib/utils.js";

/* === ИМПОРТ КОМПОНЕНТОВ ИНТЕРФЕЙСА === */
import {initTable} from "./components/table.js";
// Подключение модулей расширенной функциональности:
import { initPagination } from './components/pagination.js'; // Постраничная навигация
import { initSorting } from './components/sorting.js';       // Сортировка данных
import { initFiltering } from './components/filtering.js';    // Фильтрация записей
import { initSearching } from './components/searching.js';    // Поиск по таблице

/* === ИНИЦИАЛИЗАЦИЯ ПОИСКА === */
// Создание обработчика поиска с привязкой к полю 'search'
const applySearching = initSearching('search');

/* === СОЗДАНИЕ API ДЛЯ РАБОТЫ С ДАННЫМИ === */
// Инициализация хранилища с исходными данными
const API = initData(sourceData);

/**
 * Сбор текущего состояния интерфейса таблицы
 * Извлекает параметры фильтрации, сортировки, пагинации и поиска
 * @returns {Object} Объект состояния с полями:
 *   - rowsPerPage: число - количество записей на странице
 *   - page: число - текущая страница (по умолчанию 1)
 *   - ...другие параметры из формы
 */
function collectState() {
    // Получение данных из элементов управления таблицей
    const state = processFormData(new FormData(sampleTable.container));
    
    // Преобразование строковых значений в числовые
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1); // Значение по умолчанию для страницы
    
    // Получение текущего поискового запроса
    const searchValue = document.querySelector('input[name="search"]').value;
    
    return {
        ...state, // Все параметры из формы
        rowsPerPage, // Нормализованное количество строк
        page // Нормализованный номер страницы
    };
}

/**
 * Основная функция рендеринга таблицы
 * Вызывается при любых изменениях состояния
 * @param {HTMLButtonElement?} action - элемент, вызвавший обновление
 */
async function render(action) {
    // 1. Сбор текущего состояния интерфейса
    let state = collectState();
    
    // 2. Формирование параметров запроса
    let query = {};
    
    // 3. Последовательное применение всех операций к запросу:
    query = applyPagination(query, state, action); // Пагинация
    query = applyFiltering(query, state, action);  // Фильтрация
    query = applySearching(query, state, action);  // Поиск
    query = applySorting(query, state, action);    // Сортировка

    // 4. Получение данных с сервера/из хранилища
    const { total, items } = await API.getRecords(query);

    // 5. Обновление интерфейса
    updatePagination(total, query); // Обновление пагинации
    sampleTable.render(items);      // Перерисовка таблицы
}

/* === ИНИЦИАЛИЗАЦИЯ ОСНОВНОЙ ТАБЛИЦЫ === */
const sampleTable = initTable({
    tableTemplate: 'table',  // ID шаблона таблицы
    rowTemplate: 'row',      // ID шаблона строки
    before: ['search', 'header', 'filter'], // Элементы перед таблицей
    after: ['pagination']                   // Элементы после таблицы
}, render);

/* === НАСТРОЙКА ПАГИНАЦИИ === */
const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements, // DOM-элементы пагинации
    (el, page, isCurrent) => {      // Колбэк для рендеринга кнопки
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

/* === МОНТАЖ ИНТЕРФЕЙСА === */
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

/* === НАСТРОЙКА ПОИСКА === */
const searchInput = document.querySelector('input[name="search"]');
const resetBtn = document.querySelector('button[data-name="reset"]');

// Обработчик ввода в поисковую строку
searchInput.addEventListener('input', () => {
    render();
});

// Обработчик сброса поиска
resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    render();
});

/* === НАСТРОЙКА СОРТИРОВКИ === */
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,   // Кнопка сортировки по дате
    sampleTable.header.elements.sortByTotal   // Кнопка сортировки по сумме
]);

/* === НАСТРОЙКА ФИЛЬТРАЦИИ === */
const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);

/**
 * Инициализация приложения
 * Загрузка индексов для фильтров и первичный рендеринг
 */
async function init() { 
    const indexes = await API.getIndexes(); 
    
    // Обновление элементов фильтрации
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers // Список продавцов для фильтра
    });
} 

// Запуск приложения
init().then(render);

/* === АРХИТЕКТУРНЫЕ ЗАМЕТКИ === */
// 1. Все компоненты работают через единый цикл рендеринга
// 2. Состояние управляется централизованно через collectState()
// 3. Изменения интерфейса вызывают перерисовку через render()
// 4. API предоставляет унифицированный доступ к данным