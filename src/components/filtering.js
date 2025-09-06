/**
 * Инициализирует систему фильтрации для интерфейса
 * @param {Object} elements - Коллекция DOM-элементов фильтров
 * @returns {Object} Объект с методами для работы с фильтрацией
 */
export function initFiltering(elements) {

    /**
     * Обновляет выпадающие списки фильтров доступными значениями
     * @param {Object} elements - DOM-элементы фильтров
     * @param {Object} indexes - Объект с данными для заполнения фильтров
     */
    const updateIndexes = (elements, indexes) => {
        // Перебираем все категории фильтров, которые нужно обновить
        Object.keys(indexes).forEach((elementName) => {
            // Для каждого значения в категории создаем элемент option
            elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;  // Отображаемый текст
                el.value = name;       // Значение для отправки
                return el;
            }))
        })
    }

    /**
     * Применяет текущие настройки фильтров к запросу
     * @param {Object} query - Исходные параметры запроса
     * @param {Object} state - Текущее состояние приложения
     * @param {Object} action - Действие пользователя (опционально)
     * @returns {Object} Обновленный объект запроса с учетом фильтров
     */
    const applyFiltering = (query, state, action) => {
        // Обработка действия очистки конкретного фильтра
        if (action && action.name === 'clear') {
            // Находим поле ввода, связанное с кнопкой очистки
            const inputField = action.parentElement.querySelector('input');
            // Сбрасываем значение поля ввода
            inputField.value = '';
            // Обновляем состояние приложения
            state[action.dataset.field] = '';
            // Дальнейшее обновление интерфейса происходит через внешний render
        }

        // Формируем объект с активными фильтрами
        const filter = {};
        // Анализируем все элементы фильтрации
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                // Работаем только с input и select элементами, имеющими значение
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                    // Формируем параметр в формате filter[fieldName]=value
                    filter[`filter[${elements[key].name}]`] = elements[key].value;
                }
            }
        })

        // Возвращаем обновленный запрос, если есть активные фильтры
        // Или исходный запрос, если фильтры не применены
        return Object.keys(filter).length
            ? Object.assign({}, query, filter)
            : query;
    }

    // Публичный интерфейс модуля фильтрации
    return {
        updateIndexes,    // Метод для обновления доступных значений фильтров
        applyFiltering   // Метод для применения фильтров к запросу
    }
}