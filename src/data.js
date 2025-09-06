import { makeIndex } from "./lib/utils.js";

// Базовый URL API для получения данных
const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

/**
 * Инициализирует систему управления данными с кэшированием и преобразованием
 * @param {Object} sourceData - Исходные данные для инициализации (не используется в текущей реализации)
 * @returns {Object} Объект с методами для работы с данными
 */
export function initData(sourceData) {
    // Переменные для кэширования данных
    let sellers;      // Кэш данных о продавцах
    let customers;    // Кэш данных о покупателях
    let lastResult;   // Кэш последнего результата запроса
    let lastQuery;    // Кэш последнего query-строки

    /**
     * Преобразует сырые данные из API в формат, пригодный для отображения в таблице
     * @param {Array} data - Массив сырых данных из API
     * @returns {Array} Преобразованный массив данных для таблицы
     */
    const mapRecords = (data) =>
        data.map((item) => ({
            id: item.receipt_id,           // ID чека
            date: item.date,               // Дата операции
            seller: sellers[item.seller_id], // Имя продавца (из кэша)
            customer: customers[item.customer_id], // Имя покупателя (из кэша)
            total: item.total_amount,      // Общая сумма операции
        }));

    /**
     * Получает и кэширует справочные данные (продавцы и покупатели)
     * @returns {Promise<Object>} Объект с данными продавцов и покупателей
     */
    const getIndexes = async () => {
        // Загружаем данные только если они еще не были закэшированы
        if (!sellers || !customers) {
            // Параллельно запрашиваем данные продавцов и покупателей
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then((res) => res.json()),
                fetch(`${BASE_URL}/customers`).then((res) => res.json()),
            ]);
        }

        return { sellers, customers };
    };

    /**
     * Получает записи о продажах с сервера с поддержкой кэширования
     * @param {Object} query - Параметры запроса (фильтрация, пагинация, сортировка)
     * @param {boolean} isUpdated - Флаг принудительного обновления (игнорирует кэш)
     * @returns {Promise<Object>} Объект с данными и общей информацией
     */
    const getRecords = async (query, isUpdated = false) => {
        // Преобразуем объект параметров в query-строку
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        // Проверяем, можно ли использовать кэшированный результат
        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        // Выполняем запрос к API для получения актуальных данных
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        // Обновляем кэш
        lastQuery = nextQuery;
        lastResult = {
            total: records.total,      // Общее количество записей (для пагинации)
            items: mapRecords(records.items), // Преобразованные данные для таблицы
        };

        return lastResult;
    };

    // Публичный интерфейс модуля данных
    return {
        getIndexes,  // Метод для получения справочных данных
        getRecords,  // Метод для получения данных записей с кэшированием
    };
}