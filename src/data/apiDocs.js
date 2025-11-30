// CouchDB API Documentation Data

export const quickReference = [
    {
        title: 'HTTP Methods',
        items: [
            { method: 'GET', description: 'Retrieve data' },
            { method: 'POST', description: 'Create or query data' },
            { method: 'PUT', description: 'Create or update data' },
            { method: 'DELETE', description: 'Delete data' },
        ]
    },
    {
        title: 'Common Status Codes',
        items: [
            { code: '200', description: 'OK - Request successful' },
            { code: '201', description: 'Created - Document created' },
            { code: '404', description: 'Not Found - Resource doesn\'t exist' },
            { code: '409', description: 'Conflict - Document conflict' },
        ]
    },
];

export const apiReference = [
    {
        category: 'Database',
        items: [
            {
                title: 'List All Databases',
                method: 'GET',
                endpoint: '/_all_dbs',
                description: 'Returns a list of all databases on the server',
                example: 'GET http://localhost:5984/_all_dbs',
                response: '["_replicator", "_users", "mydb"]'
            },
            {
                title: 'Create Database',
                method: 'PUT',
                endpoint: '/{db}',
                description: 'Creates a new database',
                example: 'PUT http://localhost:5984/mydb',
                response: '{"ok": true}'
            },
            {
                title: 'Delete Database',
                method: 'DELETE',
                endpoint: '/{db}',
                description: 'Deletes a database',
                example: 'DELETE http://localhost:5984/mydb',
                response: '{"ok": true}'
            },
            {
                title: 'Database Info',
                method: 'GET',
                endpoint: '/{db}',
                description: 'Gets information about a database',
                example: 'GET http://localhost:5984/mydb',
                response: '{"db_name": "mydb", "doc_count": 42, "update_seq": "123"}'
            },
        ]
    },
    {
        category: 'Documents',
        items: [
            {
                title: 'Get Document',
                method: 'GET',
                endpoint: '/{db}/{docid}',
                description: 'Retrieves a document by ID',
                example: 'GET http://localhost:5984/mydb/doc123',
                response: '{"_id": "doc123", "_rev": "1-abc", "name": "John"}'
            },
            {
                title: 'Create Document',
                method: 'POST',
                endpoint: '/{db}',
                description: 'Creates a new document with auto-generated ID',
                example: 'POST http://localhost:5984/mydb\n{"name": "John", "age": 30}',
                response: '{"ok": true, "id": "abc123", "rev": "1-xyz"}'
            },
            {
                title: 'Update Document',
                method: 'PUT',
                endpoint: '/{db}/{docid}',
                description: 'Updates an existing document',
                example: 'PUT http://localhost:5984/mydb/doc123\n{"_rev": "1-abc", "name": "Jane"}',
                response: '{"ok": true, "id": "doc123", "rev": "2-def"}'
            },
            {
                title: 'Delete Document',
                method: 'DELETE',
                endpoint: '/{db}/{docid}?rev={rev}',
                description: 'Deletes a document',
                example: 'DELETE http://localhost:5984/mydb/doc123?rev=1-abc',
                response: '{"ok": true, "id": "doc123", "rev": "2-deleted"}'
            },
        ]
    },
];

export const queryExamples = [
    {
        category: 'Basic Queries',
        items: [
            {
                title: 'Get All Documents',
                description: 'Retrieve all documents in a database',
                code: 'GET /mydb/_all_docs?include_docs=true',
                explanation: 'The include_docs parameter includes the full document content'
            },
            {
                title: 'Get Documents with Limit',
                description: 'Limit the number of results',
                code: 'GET /mydb/_all_docs?limit=10&include_docs=true',
                explanation: 'Returns only the first 10 documents'
            },
            {
                title: 'Get Documents with Pagination',
                description: 'Skip documents for pagination',
                code: 'GET /mydb/_all_docs?skip=20&limit=10&include_docs=true',
                explanation: 'Skip first 20 documents, return next 10'
            },
        ]
    },
    {
        category: 'Mango Queries',
        items: [
            {
                title: 'Simple Selector',
                description: 'Find documents matching a field value',
                code: `POST /mydb/_find
{
  "selector": {
    "name": "John"
  }
}`,
                explanation: 'Finds all documents where name equals "John"'
            },
            {
                title: 'Multiple Conditions',
                description: 'Combine multiple conditions',
                code: `POST /mydb/_find
{
  "selector": {
    "age": {"$gt": 25},
    "city": "New York"
  }
}`,
                explanation: 'Finds documents where age > 25 AND city = "New York"'
            },
            {
                title: 'OR Operator',
                description: 'Match any of multiple conditions',
                code: `POST /mydb/_find
{
  "selector": {
    "$or": [
      {"status": "active"},
      {"priority": "high"}
    ]
  }
}`,
                explanation: 'Finds documents where status is "active" OR priority is "high"'
            },
            {
                title: 'Sort and Limit',
                description: 'Sort results and limit count',
                code: `POST /mydb/_find
{
  "selector": {"type": "user"},
  "sort": [{"age": "desc"}],
  "limit": 5
}`,
                explanation: 'Finds users, sorts by age descending, returns top 5'
            },
        ]
    },
];

export const mangoOperators = [
    {
        category: 'Comparison',
        operators: [
            { name: '$eq', description: 'Equal to', example: '{"age": {"$eq": 25}}' },
            { name: '$ne', description: 'Not equal to', example: '{"status": {"$ne": "deleted"}}' },
            { name: '$gt', description: 'Greater than', example: '{"score": {"$gt": 80}}' },
            { name: '$gte', description: 'Greater than or equal', example: '{"age": {"$gte": 18}}' },
            { name: '$lt', description: 'Less than', example: '{"price": {"$lt": 100}}' },
            { name: '$lte', description: 'Less than or equal', example: '{"quantity": {"$lte": 10}}' },
        ]
    },
    {
        category: 'Logical',
        operators: [
            { name: '$and', description: 'All conditions must match', example: '{"$and": [{"a": 1}, {"b": 2}]}' },
            { name: '$or', description: 'Any condition must match', example: '{"$or": [{"a": 1}, {"b": 2}]}' },
            { name: '$not', description: 'Negates condition', example: '{"$not": {"age": {"$lt": 18}}}' },
            { name: '$nor', description: 'None of conditions match', example: '{"$nor": [{"a": 1}, {"b": 2}]}' },
        ]
    },
    {
        category: 'Array',
        operators: [
            { name: '$in', description: 'Value in array', example: '{"status": {"$in": ["active", "pending"]}}' },
            { name: '$nin', description: 'Value not in array', example: '{"role": {"$nin": ["admin", "moderator"]}}' },
            { name: '$all', description: 'Array contains all values', example: '{"tags": {"$all": ["js", "node"]}}' },
            { name: '$size', description: 'Array has specific size', example: '{"items": {"$size": 3}}' },
        ]
    },
];

export default {
    quickReference,
    apiReference,
    queryExamples,
    mangoOperators,
};
