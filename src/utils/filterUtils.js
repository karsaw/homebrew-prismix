/**
 * Extract unique field names from an array of documents
 * @param {Array} documents - Array of document objects
 * @returns {Array} - Sorted array of unique field names
 */
export const extractFields = (documents) => {
    const fieldsSet = new Set();

    documents.forEach(doc => {
        const docData = doc.doc || doc;
        Object.keys(docData).forEach(key => {
            fieldsSet.add(key);
        });
    });

    return Array.from(fieldsSet).sort();
};

/**
 * Detect the type of a field value
 * @param {*} value - The value to check
 * @returns {string} - 'string', 'number', 'boolean', 'date', 'array', 'object', or 'null'
 */
export const detectFieldType = (value) => {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') {
        // Check if it's a date
        if (value instanceof Date || !isNaN(Date.parse(value))) return 'date';
        return 'object';
    }
    // Check if string looks like a date
    if (typeof value === 'string' && !isNaN(Date.parse(value)) && /\d{4}-\d{2}-\d{2}/.test(value)) {
        return 'date';
    }
    return 'string';
};

/**
 * Parse filter value based on type
 * @param {string} value - The raw filter value
 * @param {string} type - The expected type
 * @returns {*} - Parsed value
 */
export const parseFilterValue = (value, type) => {
    if (value === null || value === undefined || value === '') return value;

    switch (type) {
        case 'number':
            return parseFloat(value);
        case 'boolean':
            return value === 'true' || value === true;
        case 'date':
            return new Date(value);
        case 'array':
            return Array.isArray(value) ? value : value.split(',').map(v => v.trim());
        default:
            return value;
    }
};

/**
 * Apply a single filter condition to a value
 * @param {*} value - The document field value
 * @param {string} operator - The filter operator
 * @param {*} filterValue - The filter comparison value
 * @returns {boolean} - Whether the condition passes
 */
export const applyFilter = (value, operator, filterValue) => {
    // Handle null/undefined values
    if (value === null || value === undefined) {
        return operator === 'isNull' || operator === 'isEmpty';
    }

    if (filterValue === null || filterValue === undefined || filterValue === '') {
        return operator === 'isNull' || operator === 'isEmpty';
    }

    const valueStr = String(value).toLowerCase();
    const filterStr = String(filterValue).toLowerCase();

    switch (operator) {
        case 'equals':
        case '=':
        case '$eq':
            return value === filterValue;

        case 'notEquals':
        case '!=':
        case '$ne':
            return value !== filterValue;

        case 'contains':
            return valueStr.includes(filterStr);

        case 'notContains':
            return !valueStr.includes(filterStr);

        case 'startsWith':
            return valueStr.startsWith(filterStr);

        case 'endsWith':
            return valueStr.endsWith(filterStr);

        case 'greaterThan':
        case '>':
        case '$gt':
            return value > filterValue;

        case 'greaterThanOrEqual':
        case '>=':
        case '$gte':
            return value >= filterValue;

        case 'lessThan':
        case '<':
        case '$lt':
            return value < filterValue;

        case 'lessThanOrEqual':
        case '<=':
        case '$lte':
            return value <= filterValue;

        case 'inRange':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
                return value >= filterValue[0] && value <= filterValue[1];
            }
            return false;

        case 'in':
        case '$in':
            if (Array.isArray(filterValue)) {
                return filterValue.includes(value);
            }
            return false;

        case 'notIn':
        case '$nin':
            if (Array.isArray(filterValue)) {
                return !filterValue.includes(value);
            }
            return true;

        case 'isNull':
        case 'isEmpty':
            return value === null || value === undefined || value === '';

        case 'isNotNull':
        case 'isNotEmpty':
            return value !== null && value !== undefined && value !== '';

        case 'regex':
        case '$regex':
            try {
                const regex = new RegExp(filterValue, 'i');
                return regex.test(valueStr);
            } catch (e) {
                return false;
            }

        default:
            return true;
    }
};

/**
 * Apply multiple filters to documents with AND/OR logic
 * @param {Array} documents - Array of documents to filter
 * @param {Array} filters - Array of filter objects {field, operator, value}
 * @param {string} logic - 'AND' or 'OR'
 * @returns {Array} - Filtered documents
 */
export const applyFilters = (documents, filters, logic = 'AND') => {
    if (!filters || filters.length === 0) return documents;

    return documents.filter(doc => {
        const docData = doc.doc || doc;

        if (logic === 'OR') {
            // At least one filter must pass
            return filters.some(filter => {
                if (!filter.field || filter.value === undefined) return true;
                const fieldValue = docData[filter.field];
                return applyFilter(fieldValue, filter.operator, filter.value);
            });
        } else {
            // All filters must pass (AND)
            return filters.every(filter => {
                if (!filter.field || filter.value === undefined) return true;
                const fieldValue = docData[filter.field];
                return applyFilter(fieldValue, filter.operator, filter.value);
            });
        }
    });
};

/**
 * Get field value from nested object path
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-notation path (e.g., 'user.name')
 * @returns {*} - The field value
 */
export const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};
