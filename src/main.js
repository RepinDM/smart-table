import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
// @todo: подключение
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initFiltering } from './components/filtering.js';
import { initSearching } from './components/searching.js';

const applySearching = initSearching('search');

// Исходные данные используемые в render()
const API = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);    // приводим к числу
    const page = parseInt(state.page ?? 1);              // текущая страница по умолчанию 1
    const searchValue = document.querySelector('input[name="search"]').value;
    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let query = {}; // здесь будут формироваться параметры запроса
    // другие apply*
    // result = applySearching(result, state, action);
    // result = applyFiltering(result, state, action);
    // result = applySorting(result, state, action);
    query = applyPagination(query, state, action); // обновляем query

    query = applyFiltering(query, state, action);

    query = applySearching(query, state, action);

    query = applySorting(query, state, action);

    const { total, items } = await API.getRecords(query);

    updatePagination(total, query);
    sampleTable.render(items)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация
const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Обработчики для поиска
const searchInput = document.querySelector('input[name="search"]');
const resetBtn = document.querySelector('button[data-name="reset"]');

searchInput.addEventListener('input', () => {
render();
});
resetBtn.addEventListener('click', () => {
searchInput.value = '';
render();
});

// Вызов initSorting 
const applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);    // передаём элементы фильтра
//    searchBySeller: indexes.sellers                                     // для элемента с именем searchBySeller устанавливаем массив продавцов
//});

async function init() { 
    const indexes = await API.getIndexes(); 

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
} 

init().then(render);