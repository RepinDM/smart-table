export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;
                el.value = name;
                return el;
            }))
        })
    }

    const applyFiltering = (query, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.type === 'click' && action.name === 'clear') {
            // Найти кнопку "clear"
            const button = action.element; // предполагается, что action.element — это кнопка
            if (button) {
                // Получить родительский элемент кнопки
                const parent = button.parentElement;
                if (parent) {
                    // Найти input внутри родителя
                    const input = parent.querySelector('input[data-field]');
                    if (input) {
                        input.value = ''; // очистить значение input
                        const fieldName = input.getAttribute('data-field');
                        if (fieldName) {
                        state[fieldName] = '';
                        }
                    }
                }
            }
        }      

        // @todo: #4.5 — отфильтровать данные, используя компаратор
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) { // ищем поля ввода в фильтре с непустыми данными
                    filter[`filter[${elements[key].name}]`] = elements[key].value; // чтобы сформировать в query вложенный объект фильтра
                }
            }
        })

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; // если в фильтре что-то добавилось, применим к запросу
    }

    return {
        updateIndexes,
        applyFiltering
    }
}