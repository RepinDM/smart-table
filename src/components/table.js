import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализирует таблицу данных с поддержкой обработки действий пользователя
 * @param {Object} settings - Настройки для инициализации таблицы
 * @param {HTMLElement} settings.tableTemplate - Шаблон таблицы
 * @param {HTMLElement} settings.rowTemplate - Шаблон строки таблицы
 * @param {Array<string>} settings.before - Список компонентов для размещения перед таблицей
 * @param {Array<string>} settings.after - Список компонентов для размещения после таблицы
 * @param {Function} onAction - Коллбэк-функция, вызываемая при действиях пользователя
 * @returns {Object} Объект с элементами таблицы и методом render
 */
export function initTable(settings, onAction) {
    const { tableTemplate, rowTemplate, before, after } = settings;

    // Создаем корневой элемент таблицы из шаблона
    const root = cloneTemplate(tableTemplate);

    // Добавляем компоненты перед основной таблицей (в обратном порядке)
    before.reverse().forEach((subName) => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    // Добавляем компоненты после основной таблицы
    after.forEach((subName) => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    // Обработчик изменений в элементах управления таблицы
    root.container.addEventListener('change', onAction);

    /**
     * Обработчик сброса всех фильтров
     * При нажатии "Reset all filters" происходит:
     * - Сброс значений всех полей фильтрации
     * - Вызов render после завершения сброса
     * - Отправка запроса на сервер без параметров фильтрации
     * - Загрузка полного набора данных
     * - Обновление таблицы
     */
    root.container.addEventListener('reset', () => setTimeout(onAction, 0));

    // Обработчик отправки форм (предотвращает стандартное поведение)
    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    /**
     * Обновляет содержимое таблицы новыми данными
     * @param {Array<Object>} data - Массив объектов с данными для отображения
     */
    const render = (data) => {
        // Создаем новые строки таблицы из данных
        const nextRows = data.map((item) => {
            const row = cloneTemplate(rowTemplate);

            // Заполняем каждое поле строки соответствующими данными
            Object.keys(item).forEach(key => {
                if (key in row.elements) {
                    const element = row.elements[key];

                    // Для input и select элементов устанавливаем value
                    if (['INPUT', 'SELECT'].includes(element.tagName)) {
                        element.value = item[key];
                    } else {
                        // Для других элементов устанавливаем текстовое содержимое
                        element.textContent = item[key];
                    }
                }
            });

            return row.container;
        });

        // Заменяем текущие строки таблицы новыми
        root.elements.rows.replaceChildren(...nextRows);
    };

    // Возвращаем публичный интерфейс с доступом к элементам и методу render
    return {...root, render};
}
