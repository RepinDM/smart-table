import { getPages } from "../lib/utils.js";

/**
 * Инициализирует систему пагинации для таблицы данных
 * @param {Object} elements - DOM-элементы пагинации
 * @param {HTMLElement} elements.pages - Контейнер для кнопок страниц
 * @param {HTMLElement} elements.fromRow - Элемент для отображения первой строки
 * @param {HTMLElement} elements.toRow - Элемент для отображения последней строки
 * @param {HTMLElement} elements.totalRows - Элемент для отображения общего количества строк
 * @param {Function} createPage - Функция создания элемента страницы
 * @returns {Object} Объект с методами управления пагинацией
 */
export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    // Подготовка шаблона кнопки страницы из первого элемента контейнера
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    // Очистка контейнера от исходного шаблона
    pages.firstElementChild.remove();

    // Переменная для хранения общего количества страниц
    let pageCount;

    /**
     * Применяет параметры пагинации к объекту запроса
     * @param {Object} query - Исходные параметры запроса
     * @param {Object} state - Текущее состояние приложения
     * @param {Object} action - Действие пользователя (опционально)
     * @returns {Object} Обновленный объект запроса с параметрами пагинации
     */
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // Обработка действий навигации по страницам
        if (action) {
            switch (action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);  // Переход на предыдущую страницу
                    break;
                case 'next':
                    page = Math.min(pageCount, page + 1);  // Переход на следующую страницу
                    break;
                case 'first':
                    page = 1;  // Переход на первую страницу
                    break;
                case 'last':
                    page = pageCount;  // Переход на последнюю страницу
                    break;
            }
        }

        // Возвращаем новый объект запроса с обновленными параметрами
        return Object.assign({}, query, {
            limit,
            page
        });
    };

    /**
     * Обновляет визуальное отображение пагинации
     * @param {number} total - Общее количество элементов
     * @param {Object} pagination - Параметры пагинации
     * @param {number} pagination.page - Текущая страница
     * @param {number} pagination.limit - Количество элементов на странице
     */
    const updatePagination = (total, { page, limit }) => {
        // Вычисляем общее количество страниц
        pageCount = Math.ceil(total / limit);

        // Получаем массив страниц для отображения (максимум 5)
        const visiblePages = getPages(page, pageCount, 5);

        // Обновляем кнопки страниц в контейнере
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            // Используем callback для настройки внешнего вида кнопки
            return createPage(el, pageNumber, pageNumber === page);
        }));

        // Обновляем информацию о диапазоне отображаемых строк
        fromRow.textContent = (page - 1) * limit + 1;
        toRow.textContent = Math.min((page * limit), total);
        totalRows.textContent = total;
    };

    // Публичный интерфейс модуля пагинации
    return {
        updatePagination,  // Метод для обновления отображения пагинации
        applyPagination    // Метод для применения параметров пагинации к запросу
    };
};