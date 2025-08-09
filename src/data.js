import {makeIndex} from "./lib/utils.js";

// Базовый URL API для работы с данными о продажах
const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

/**
 * Инициализация модуля работы с данными
 * @param {Array} sourceData - Исходные данные для инициализации
 * @returns {Object} API для работы с данными
 */
export function initData(sourceData) {
    // Локальное кэширование данных для оптимизации
    let sellers;    // Кэш данных о продавцах
    let customers;  // Кэш данных о покупателях
    let lastResult; // Кэш последнего результата запроса
    let lastQuery;  // Кэш последних параметров запроса

    /**
     * Преобразует сырые данные API в формат, понятный таблице
     * @param {Array} data - Массив записей из API
     * @returns {Array} Нормализованные данные для отображения
     */
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,       // ID чека
        date: item.date,           // Дата продажи
        seller: sellers[item.seller_id],   // Имя продавца по ID
        customer: customers[item.customer_id], // Имя покупателя по ID
        total: item.total_amount   // Сумма продажи
    }));

    /**
     * Получает и кэширует справочники продавцов и покупателей
     * @returns {Promise<Object>} Объект с индексами
     */
    const getIndexes = async () => {
        // Загружаем данные только если они еще не загружены
        if (!sellers || !customers) {
            // Параллельная загрузка справочников
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`)
                    .then(res => res.json())
                    .then(data => makeIndex(data, 'id')), // Создаем индекс по ID
                fetch(`${BASE_URL}/customers`)
                    .then(res => res.json())
                    .then(data => makeIndex(data, 'id'))
            ]);
        }

        return { 
            sellers: Object.values(sellers), 
            customers: Object.values(customers)
        };
    }

    /**
     * Получает записи о продажах с возможностью кэширования
     * @param {Object} query - Параметры запроса (фильтры, сортировка и т.д.)
     * @param {Boolean} [isUpdated=false] - Флаг принудительного обновления
     * @returns {Promise<Object>} Результат с данными и общей суммой
     */
    const getRecords = async (query, isUpdated = false) => {
        // Формируем строку запроса
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        // Используем кэш, если параметры не изменились
        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        // Выполняем новый запрос к API
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const records = await response.json();

        // Обновляем кэш
        lastQuery = nextQuery;
        lastResult = {
            total: records.total,         // Общее количество записей
            items: mapRecords(records.items) // Преобразованные данные
        };

        return lastResult;
    };

    // Публичное API модуля
    return {
        getIndexes,   // Метод получения справочников
        getRecords    // Метод получения данных о продажах
    };
}

/* 
 * Особенности реализации:
 * 1. Используется двойное кэширование - как справочников, так и запросов
 * 2. Оптимизирована работа с сетью через проверку параметров запроса
 * 3. Данные нормализуются перед отдачей наружу
 * 4. Обработка ошибок вынесена на уровень выше
 * 5. Поддержка принудительного обновления данных
 */
