"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithCoach = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const openai_1 = __importDefault(require("openai"));
const workoutCatalog_1 = require("./workoutCatalog");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const openAiApiKey = (0, params_1.defineSecret)('OPENAI_API_KEY');
const tools = [
    {
        type: 'function',
        strict: true,
        name: 'get_recent_workouts',
        description: 'Fetch the signed-in user recent workout sessions and summary signals.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                limit: { type: 'number', description: 'How many recent workouts to fetch, default 5.' }
            }
        }
    },
    {
        type: 'function',
        strict: true,
        name: 'get_user_stats',
        description: 'Fetch the signed-in user profile stats and preferences from FitVision.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {}
        }
    },
    {
        type: 'function',
        strict: true,
        name: 'search_workout_library',
        description: 'Search the FitVision workout library by query, category, or difficulty.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                query: { type: 'string', description: 'The user search query.' },
                category: { type: 'string', description: 'Optional workout category filter.' },
                difficulty: { type: 'string', description: 'Optional workout difficulty filter.' }
            },
            required: ['query']
        }
    }
];
const systemPrompt = `
You are FitVision AI Coach, a concise and encouraging in-app fitness assistant.
Priorities:
- Give practical, safe, beginner-friendly workout guidance.
- When tools provide FitVision user data, use it to personalize suggestions.
- Recommend only FitVision-compatible exercises from the workout library when possible.
- Keep answers structured, short, and actionable.
- Avoid medical diagnosis. If pain, injury, or dizziness is mentioned, recommend professional guidance.
- End with 2-3 suggested next prompts when helpful.
`.trim();
const normalizeText = (value) => (typeof value === 'string' ? value.toLowerCase().trim() : '');
async function getRecentWorkouts(userId, limit = 5) {
    const normalizedLimit = Math.max(1, Math.min(limit, 10));
    let snapshot;
    try {
        snapshot = await db
            .collection('workouts')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(normalizedLimit)
            .get();
    }
    catch {
        snapshot = await db
            .collection('workouts')
            .where('userId', '==', userId)
            .limit(normalizedLimit)
            .get();
    }
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            workoutName: data.workoutType?.name ?? 'Workout',
            category: data.workoutType?.category ?? 'unknown',
            difficulty: data.workoutType?.difficulty ?? 'unknown',
            repsCompleted: data.repsCompleted ?? 0,
            calories: data.calories ?? 0,
            durationSeconds: data.duration ?? 0,
            formScore: data.formScore ?? data.accuracy ?? 0,
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null
        };
    });
}
async function getUserStats(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    const statsDoc = await db.collection('userStats').doc(userId).get();
    return {
        profile: userDoc.exists ? userDoc.data() : null,
        workoutStats: statsDoc.exists ? statsDoc.data() : null
    };
}
function searchWorkoutLibrary({ query, category, difficulty }) {
    const queryValue = normalizeText(query);
    const categoryValue = normalizeText(category);
    const difficultyValue = normalizeText(difficulty);
    return workoutCatalog_1.workoutCatalog
        .filter((workout) => {
        const matchesQuery = !queryValue ||
            workout.name.toLowerCase().includes(queryValue) ||
            workout.description.toLowerCase().includes(queryValue) ||
            workout.category.toLowerCase().includes(queryValue);
        const matchesCategory = !categoryValue || workout.category === categoryValue;
        const matchesDifficulty = !difficultyValue || workout.difficulty === difficultyValue;
        return matchesQuery && matchesCategory && matchesDifficulty;
    })
        .slice(0, 8);
}
async function runTool(userId, name, rawArguments) {
    const parsedArguments = rawArguments ? JSON.parse(rawArguments) : {};
    switch (name) {
        case 'get_recent_workouts':
            if (!userId) {
                return { error: 'User is not signed in.' };
            }
            return await getRecentWorkouts(userId, parsedArguments.limit);
        case 'get_user_stats':
            if (!userId) {
                return { error: 'User is not signed in.' };
            }
            return await getUserStats(userId);
        case 'search_workout_library':
            return searchWorkoutLibrary(parsedArguments);
        default:
            return { error: `Unknown tool: ${name}` };
    }
}
exports.chatWithCoach = (0, https_1.onCall)({
    secrets: [openAiApiKey]
}, async (request) => {
    const apiKey = openAiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'OPENAI_API_KEY secret is not configured.');
    }
    const message = `${request.data?.message || ''}`.trim();
    const history = Array.isArray(request.data?.history) ? request.data.history : [];
    if (!message) {
        throw new https_1.HttpsError('invalid-argument', 'A message is required.');
    }
    const client = new openai_1.default({ apiKey });
    const responseInput = [
        {
            role: 'system',
            content: [{ type: 'input_text', text: systemPrompt }]
        },
        ...history.slice(-8).map((item) => ({
            role: item.role,
            content: [{ type: 'input_text', text: item.content }]
        }))
    ];
    let response = await client.responses.create({
        model: 'gpt-4.1-mini',
        input: responseInput,
        tools,
        tool_choice: 'auto'
    });
    const usedTools = new Set();
    while (response.output.some((item) => item.type === 'function_call')) {
        const functionCalls = response.output.filter((item) => item.type === 'function_call');
        const toolOutputs = [];
        for (const call of functionCalls) {
            usedTools.add(call.name);
            const result = await runTool(request.auth?.uid ?? null, call.name, call.arguments);
            toolOutputs.push({
                type: 'function_call_output',
                call_id: call.call_id,
                output: JSON.stringify(result)
            });
        }
        response = await client.responses.create({
            model: 'gpt-4.1-mini',
            previous_response_id: response.id,
            input: toolOutputs,
            tools,
            tool_choice: 'auto'
        });
    }
    const reply = response.output_text?.trim() || 'I could not generate a response just now.';
    const suggestions = [
        'Recommend my next workout.',
        'Summarize my recent progress.',
        'Find a workout for endurance.'
    ];
    return {
        reply,
        suggestions,
        usedTools: Array.from(usedTools)
    };
});
//# sourceMappingURL=index.js.map