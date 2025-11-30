
/**
 * Service to handle AI API calls for query generation
 */

export const generateQuery = async (provider, apiKey, model, schema, prompt) => {
    const systemPrompt = `You are an expert in CouchDB Mango Queries.
    Your task is to generate a valid CouchDB Mango Query JSON based on the user's natural language request and the provided database schema.
    
    Database Schema (available fields):
    ${JSON.stringify(schema, null, 2)}
    
    Rules:
    1. Return ONLY the JSON object. Do not include markdown formatting, explanations, or code blocks.
    2. The JSON must be a valid CouchDB selector object (or full query object with selector, limit, sort, fields).
    3. Use the available fields from the schema.
    4. If the user asks for something impossible based on the schema, try your best to interpret it or return an empty selector.
    `;

    try {
        if (provider === 'openai') {
            return await callOpenAI(apiKey, model, systemPrompt, prompt);
        } else if (provider === 'gemini') {
            return await callGemini(apiKey, model, systemPrompt, prompt);
        } else if (provider === 'anthropic') {
            return await callAnthropic(apiKey, model, systemPrompt, prompt);
        } else {
            throw new Error('Unsupported provider');
        }
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};

const callOpenAI = async (apiKey, model, systemPrompt, userPrompt) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model || 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return cleanJsonOutput(content);
};

const callGemini = async (apiKey, model, systemPrompt, userPrompt) => {
    // Note: Gemini API structure might differ slightly depending on the specific endpoint version
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nUser Request: ${userPrompt}`
                }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    return cleanJsonOutput(content);
};

const callAnthropic = async (apiKey, model, systemPrompt, userPrompt) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: model || 'claude-3-opus-20240229',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                { role: 'user', content: userPrompt }
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Anthropic API request failed');
    }

    const data = await response.json();
    const content = data.content[0].text;
    return cleanJsonOutput(content);
};

const cleanJsonOutput = (text) => {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return cleaned;
};
