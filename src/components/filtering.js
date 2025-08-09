/**
 * Инициализирует систему фильтрации для таблицы данных
 * @param {Object} elements - DOM-элементы фильтров (input, select)
 * @returns {Object} API фильтрации ({updateIndexes, applyFiltering})
 */
export function initFiltering(elements) {
    /**
     * Обновляет доступные значения в фильтрах-селектах
     * @param {Object} elements - DOM-элементы фильтров
     * @param {Object} indexes - Объект с доступными значениями для фильтрации
     * Пример: {searchBySeller: {'id1': 'Иван', 'id2': 'Петр'}}
     */
    const updateIndexes = (elements, indexes) => {
        // Для каждого фильтра из переданных индексов
        Object.keys(indexes).forEach((elementName) => {
            // Создаем option для каждого значения
            const options = Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;  // Отображаемое имя
                el.value = name;       // Значение для фильтрации
                return el;
            });
            
            // Добавляем созданные options в соответствующий select
            elements[elementName].append(...options);
        });
    };

    /**
     * Применяет текущие фильтры к запросу
     * @param {Object} query - Текущий query-объект
     * @param {Object} state - Состояние фильтров
     * @param {Object|null} action - Действие пользователя (если было)
     * @returns {Object} Новый query-объект с примененными фильтрами
     */
    const applyFiltering = (query, state, action) => {
        // Обработка сброса фильтра через кнопку "Очистить"
        if (action && action.type === 'click' && action.name === 'clear') {
            const button = action.element;
            if (button) {
                const parent = button.parentElement;
                if (parent) {
                    const input = parent.querySelector('input[data-field]');
                    if (input) {
                        input.value = '';  // Сбрасываем значение
                        const fieldName = input.getAttribute('data-field');
                        if (fieldName) {
                            state[fieldName] = '';  // Обновляем состояние
                        }
                    }
                }
            }
        }

        // Формируем объект фильтров из заполненных полей
        const filter = {};
        Object.keys(elements).forEach(key => {
            const element = elements[key];
            if (element && ['INPUT', 'SELECT'].includes(element.tagName)) {
                // Добавляем только непустые значения
                if (element.value) {
                    // Формируем ключ в формате filter[fieldName]
                    filter[`filter[${element.name}]`] = element.value;
                }
            }
        });

        // Возвращаем новый query, объединяя с фильтрами (если они есть)
        return Object.keys(filter).length 
            ? {...query, ...filter}  // ES6 spread вместо Object.assign
            : query;
    };

    // Публичное API модуля фильтрации
    return {
        updateIndexes,  // Метод обновления доступных значений фильтров
        applyFiltering // Метод применения фильтров к запросу
    };
}

/* 
 * Особенности реализации:
 * 1. Поддержка динамического обновления фильтруемых значений
 * 2. Автоматическая обработка сброса фильтров
 * 3. Гибкое формирование query-параметров для API
 * 4. Оптимизированная работа с DOM (минимальное количество операций)
 * 5. Чистая функция applyFiltering без side effects
 */