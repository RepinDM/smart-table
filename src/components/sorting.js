import { sortMap } from "../lib/sort.js";

/**
 * Инициализирует систему сортировки для таблицы данных
 * @param {Array<HTMLElement>} columns - Массив DOM-элементов кнопок сортировки
 * @returns {Function} Функция для применения параметров сортировки к запросу
 */
export function initSorting(columns) {
    /**
     * Применяет параметры сортировки к объекту запроса
     * @param {Object} query - Исходные параметры запроса
     * @param {Object} state - Текущее состояние приложения
     * @param {Object} action - Действие пользователя (опционально)
     * @returns {Object} Обновленный объект запроса с параметрами сортировки
     */
    return (query, state, action) => {
        // Переменные для хранения параметров сортировки
        let field = null;
        let order = null;

        // Обработка действия сортировки пользователем
        if (action && action.name === 'sort') {
            // Обновляем состояние кнопки на следующее значение из карты сортировки
            action.dataset.value = sortMap[action.dataset.value];

            // Извлекаем параметры сортировки из данных кнопки
            field = action.dataset.field;
            order = action.dataset.value;

            // Сбрасываем сортировку во всех остальных колонках
            columns.forEach(column => {
                // Игнорируем активную колонку, с которой работает пользователь
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';  // Возвращаем в исходное состояние
                }
            });
        } else {
            // Восстанавливаем текущую сортировку из состояния DOM
            columns.forEach(column => {
                // Ищем колонку с активной сортировкой
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;  // Получаем поле сортировки
                    order = column.dataset.value;  // Получаем направление сортировки
                }
            });
        }

        // Формируем параметр сортировки в формате "поле:направление"
        const sort = (field && order !== 'none')
            ? `${field}:${order}`
            : null;

        // Возвращаем обновленный запрос с параметром сортировки или исходный запрос
        return sort
            ? Object.assign({}, query, { sort })
            : query;
    };
}