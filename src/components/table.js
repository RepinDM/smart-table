// Импорт вспомогательной функции для клонирования шаблонов
import {cloneTemplate} from "../lib/utils.js";

/**
 * Фабрика для создания интерактивной таблицы с обработкой действий
 * @param {Object} settings - Конфигурационные параметры таблицы
 * @param {HTMLElement} settings.tableTemplate - Шаблон таблицы
 * @param {HTMLElement} settings.rowTemplate - Шаблон строки таблицы
 * @param {Array<string>} settings.before - Список шаблонов для вставки перед таблицей
 * @param {Array<string>} settings.after - Список шаблонов для вставки после таблицы
 * @param {(action: HTMLButtonElement|undefined) => void} onAction - Коллбэк при действиях с таблицей
 * @returns {Object} Объект с элементами таблицы и методом render
 */
export function initTable(settings, onAction) {
    // Деструктуризация настроек
    const {tableTemplate, rowTemplate, before, after} = settings;
    
    // Создание корневого элемента таблицы
    const root = cloneTemplate(tableTemplate);

    // Добавление дополнительных элементов перед таблицей
    // Реверсируем порядок для правильной вставки через prepend
    before.reverse().forEach(templateName => {
        root[templateName] = cloneTemplate(templateName);
        root.container.prepend(root[templateName].container);
    });
    
    // Добавление дополнительных элементов после таблицы
    after.forEach(templateName => {
        root[templateName] = cloneTemplate(templateName);
        root.container.append(root[templateName].container);
    });

    // Обработка событий таблицы
    root.container.addEventListener('change', () => {
        // Вызов коллбэка при изменении данных
        onAction();
    });
    
    root.container.addEventListener('reset', () => {
        // Асинхронный вызов после сброса формы
        setTimeout(onAction);
    });
    
    root.container.addEventListener('submit', (e) => {
        // Предотвращение стандартного поведения формы
        e.preventDefault();
        // Передача элемента, инициировавшего отправку
        onAction(e.submitter);
    });

    /**
     * Функция рендеринга данных в таблицу
     * @param {Array<Object>} data - Массив объектов с данными для отображения
     */
    const render = (data) => {
        // Преобразование данных в DOM-элементы строк
        const nextRows = data.map(item => {
            // Клонирование шаблона строки
            const row = cloneTemplate(rowTemplate);
        
            // Заполнение строки данными
            Object.keys(item).forEach(key => {
                if (row.elements[key]) {
                    row.elements[key].textContent = item[key];
                }
            });
        
            return row.container;
        });
        
        // Замена содержимого контейнера строк
        root.elements.rows.replaceChildren(...nextRows);
    }

    // Возвращаем объект с элементами таблицы и функцией рендеринга
    return {...root, render};
}