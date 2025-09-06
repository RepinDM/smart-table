import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

// Инициализация API для работы с данными
const api = initData(sourceData);

/**
 * Собирает и обрабатывает состояние формы таблицы
 * @returns {Object} Объект состояния с параметрами пагинации и фильтрации
 */
function collectState() {
    // Получаем данные формы из DOM-элементов таблицы
    const state = processFormData(new FormData(sampleTable.container));

    // Преобразуем параметры пагинации в числовой формат
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page,
    };
}

/**
 * Основная функция рендеринга, обновляющая интерфейс при изменениях
 * @param {HTMLButtonElement|null} action - Действие пользователя, вызвавшее обновление
 */
async function render(action) {
    // Собираем текущее состояние интерфейса
    let state = collectState();
    let query = {};

    // Последовательно применяем все модули обработки запроса
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    // Получаем данные с сервера с примененными параметрами
    const { total, items } = await api.getRecords(query);

    // Обновляем элементы интерфейса
    updatePagination(total, query);
    sampleTable.render(items);
}

// Инициализация основной таблицы с компонентами
const sampleTable = initTable(
    {
        tableTemplate: "table",
        rowTemplate: "row",
        before: ["search", "header", "filter"], // Компоненты перед таблицей
        after: ["pagination"],                  // Компоненты после таблицы
    },
    render // Коллбэк для обработки действий
);

// Инициализация модуля пагинации
const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        // Заполняем элементы кнопки пагинации данными
        const input = el.querySelector("input");
        const label = el.querySelector("span");
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

// Инициализация модуля сортировки
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal,
]);

// Инициализация модуля фильтрации
const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);

// Инициализация модуля поиска
const applySearching = initSearching('search');

// Размещение таблицы в DOM
const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

/**
 * Инициализация приложения: загрузка справочных данных и первичный рендеринг
 */
async function init() {
    // Загружаем справочные данные (продавцы, покупатели)
    const indexes = await api.getIndexes();

    // Обновляем фильтры доступными значениями
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers,
    });
}

// Запуск инициализации и первичного рендеринга
init().then(render);