/**
 * Compare two values with type awareness
 * @param {*} a - First value
 * @param {*} b - Second value
 * @param {string} type - The field type
 * @returns {number} - -1 if a < b, 0 if equal, 1 if a > b
 */
export const compareValues = (a, b, type = 'string') => {
    // Handle null/undefined
    if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
    if (b === null || b === undefined) return 1;

    switch (type) {
        case 'number':
            return Number(a) - Number(b);

        case 'date':
            const dateA = a instanceof Date ? a : new Date(a);
            const dateB = b instanceof Date ? b : new Date(b);
            return dateA.getTime() - dateB.getTime();

        case 'boolean':
            return (a === b) ? 0 : a ? 1 : -1;

        case 'string':
        default:
            const strA = String(a).toLowerCase();
            const strB = String(b).toLowerCase();
            return strA.localeCompare(strB);
    }
};

/**
 * Apply multi-column sorting to documents
 * @param {Array} documents - Array of documents to sort
 * @param {Array} sortConfig - Array of sort objects {field, direction, type}
 * @returns {Array} - Sorted documents (new array)
 */
export const applySorting = (documents, sortConfig) => {
    if (!sortConfig || sortConfig.length === 0) return documents;

    return [...documents].sort((a, b) => {
        const docA = a.doc || a;
        const docB = b.doc || b;

        for (const sort of sortConfig) {
            const { field, direction = 'asc', type = 'string' } = sort;

            const valueA = getNestedValue(docA, field);
            const valueB = getNestedValue(docB, field);

            const comparison = compareValues(valueA, valueB, type);

            if (comparison !== 0) {
                return direction === 'desc' ? -comparison : comparison;
            }
        }

        return 0;
    });
};

/**
 * Auto-detect field type from sample values
 * @param {Array} documents - Array of documents
 * @param {string} field - Field name to check
 * @returns {string} - Detected type
 */
export const detectFieldTypeFromDocuments = (documents, field) => {
    // Sample first few non-null values
    const samples = documents
        .map(doc => (doc.doc || doc)[field])
        .filter(val => val !== null && val !== undefined)
        .slice(0, 10);

    if (samples.length === 0) return 'string';

    // Check if all samples are numbers
    if (samples.every(val => typeof val === 'number' || !isNaN(Number(val)))) {
        return 'number';
    }

    // Check if all samples are booleans
    if (samples.every(val => typeof val === 'boolean')) {
        return 'boolean';
    }

    // Check if all samples are dates
    if (samples.every(val => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && /\d{4}-\d{2}-\d{2}/.test(String(val));
    })) {
        return 'date';
    }

    // Check if all samples are arrays
    if (samples.every(val => Array.isArray(val))) {
        return 'array';
    }

    return 'string';
};

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-notation path (e.g., 'user.name')
 * @returns {*} - The field value
 */
export const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Create a stable sort key for a document
 * @param {Object} doc - The document
 * @param {Array} sortConfig - Sort configuration
 * @returns {string} - Stable sort key
 */
export const createSortKey = (doc, sortConfig) => {
    const docData = doc.doc || doc;
    return sortConfig
        .map(sort => {
            const value = getNestedValue(docData, sort.field);
            return `${value}`;
        })
        .join('|');
};
