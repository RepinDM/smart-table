import {getPages} from "../lib/utils.js";

/**
 * Инициализирует систему пагинации для таблицы данных
 * @param {Object} elements - DOM-элементы пагинации:
 *   - pages: контейнер для кнопок страниц
 *   - fromRow: элемент для отображения первой строки
 *   - toRow: элемент для отображения последней строки
 *   - totalRows: элемент для отображения общего количества строк
 * @param {Function} createPage - Функция создания элемента страницы
 * @returns {Object} API пагинации ({updatePagination, applyPagination})
 */
export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // Подготовка шаблона кнопки страницы
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove(); // Удаляем оригинальный шаблон из DOM

    let pageCount; // Общее количество страниц (вычисляется динамически)

    /**
     * Применяет параметры пагинации к запросу
     * @param {Object} query - Исходный запрос
     * @param {Object} state - Текущее состояние
     * @param {Object|null} action - Действие пользователя (если есть)
     * @returns {Object} Новый запрос с параметрами пагинации
     */
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage; // Количество строк на странице
        let page = state.page;           // Текущая страница

        // Обработка действий навигации
        if (action) {
            switch(action.name) {
                case 'prev':  // Переход на предыдущую страницу
                    page = Math.max(1, page - 1);
                    break;
                case 'next':  // Переход на следующую страницу
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'first': // Переход на первую страницу
                    page = 1;
                    break;
                case 'last':  // Переход на последнюю страницу
                    page = pageCount;
                    break;
            }
        }

        // Возвращаем новый запрос с параметрами пагинации
        return {
            ...query,
            limit,
            page
        };
    };

    /**
     * Обновляет отображение пагинации
     * @param {number} total - Общее количество записей
     * @param {Object} params - Параметры пагинации:
     *   - page: текущая страница
     *   - limit: количество записей на странице
     */
    const updatePagination = (total, { page, limit }) => {
        // Вычисляем общее количество страниц
        pageCount = Math.ceil(total / limit);

        // Получаем диапазон видимых страниц (с учетом текущей позиции)
        const visiblePages = getPages(page, pageCount, 5);
        
        // Создаем кнопки страниц
        const pageButtons = visiblePages.map(pageNumber => {
            const pageElement = pageTemplate.cloneNode(true);
            return createPage(
                pageElement, 
                pageNumber, 
                pageNumber === page // Флаг активной страницы
            );
        });

        // Обновляем DOM
        pages.replaceChildren(...pageButtons);

        // Обновляем информацию о строках
        const startRow = (page - 1) * limit + 1;
        const endRow = Math.min(page * limit, total);
        
        fromRow.textContent = startRow;
        toRow.textContent = endRow;
        totalRows.textContent = total;
    };

    // Публичное API модуля пагинации
    return {
        updatePagination, // Метод обновления отображения
        applyPagination   // Метод применения параметров пагинации
    };
};

/**
 * Особенности реализации:
 * 1. Динамическое вычисление количества страниц
 * 2. Оптимизированное обновление DOM (минимальные перерисовки)
 * 3. Поддержка различных действий навигации
 * 4. Гибкая система отображения видимых страниц
 * 5. Чистые функции без side effects
 */