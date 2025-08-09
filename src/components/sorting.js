// Импорт вспомогательной функции для работы с сортировкой
import {sortMap} from "../lib/sort.js";

/**
 * Фабрика для создания middleware обработки сортировки табличных данных
 * @param {Array<HTMLElement>} columns - Коллекция DOM-элементов колонок таблицы
 * @returns {Function} Функция-обработчик для модификации query-параметров
 */
export function initSorting(columns) {
    /**
     * Обработчик сортировки для Redux middleware
     * @param {Object} query - Текущие параметры запроса
     * @param {Object} state - Состояние приложения
     * @param {Object} action - Объект действия Redux
     * @returns {Object} Новый объект query с учетом сортировки
     */
    return (query, state, action) => {
        // Инициализация переменных для хранения параметров сортировки
        let field = null;
        let order = null;

        // Обработка действия сортировки
        if (action && action.name === 'sort') {
            // Преобразуем значение сортировки через маппинг
            action.dataset.value = sortMap[action.dataset.value];
            
            // Получаем параметры сортировки из данных кнопки
            field = action.dataset.field;
            order = action.dataset.value;

            // Сброс сортировки в других колонках
            columns.forEach(column => {
                // Игнорируем активную колонку
                if (column.dataset.field !== action.dataset.field) {
                    // Возвращаем колонку в исходное состояние
                    column.dataset.value = 'none';
                }
            });
        } else {
            // Восстановление текущей сортировки из DOM
            columns.forEach(column => {
                // Ищем колонку с активной сортировкой
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        // Формируем параметр сортировки для API
        const sort = (field && order !== 'none') 
            ? `${field}:${order}`  // Формат: поле:направление
            : null;  // Нет сортировки

        // Возвращаем обновленные параметры запроса
        return sort 
            ? Object.assign({}, query, { sort })  // Добавляем сортировку
            : query;  // Возвращаем исходный query
    }
}