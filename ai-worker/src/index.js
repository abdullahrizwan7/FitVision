import { workoutCatalog } from './workoutCatalog.js';

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
});

const systemInstruction = `
You are FitVision AI Coach, a concise and supportive fitness assistant.
Use workout data when provided.
Recommend FitVision-compatible workouts from the supplied catalog when possible.
Do not diagnose injuries or provide medical advice.
Keep answers practical, short, and actionable.
Return 2 or 3 suggested follow-up prompts when helpful.
`.trim();

function jsonResponse(body, status = 200, origin = '*') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin)
    }
  });
}

function searchWorkoutLibrary(query = '', category = '', difficulty = '') {
  const normalizedQuery = `${query}`.toLowerCase().trim();
  const normalizedCategory = `${category}`.toLowerCase().trim();
  const normalizedDifficulty = `${difficulty}`.toLowerCase().trim();

  return workoutCatalog.filter((workout) => {
    const matchesQuery =
      !normalizedQuery ||
      workout.name.toLowerCase().includes(normalizedQuery) ||
      workout.description.toLowerCase().includes(normalizedQuery) ||
      workout.category.toLowerCase().includes(normalizedQuery);

    const matchesCategory = !normalizedCategory || workout.category === normalizedCategory;
    const matchesDifficulty = !normalizedDifficulty || workout.difficulty === normalizedDifficulty;

    return matchesQuery && matchesCategory && matchesDifficulty;
  }).slice(0, 8);
}

async function callGemini(apiKey, payload) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Gemini request failed.');
  }

  return response.json();
}

function buildPrompt(message, history) {
  const condensedHistory = history
    .slice(-8)
    .map((item) => `${item.role === 'assistant' ? 'Coach' : 'User'}: ${item.content}`)
    .join('\n');

  const workoutMatches = searchWorkoutLibrary(message);

  return [
    systemInstruction,
    condensedHistory ? `Conversation so far:\n${condensedHistory}` : '',
    workoutMatches.length
      ? `Relevant FitVision workouts:\n${workoutMatches
          .map((workout) => `- ${workout.name} (${workout.category}, ${workout.difficulty}, ${workout.duration} min): ${workout.description}`)
          .join('\n')}`
      : '',
    `User request: ${message}`,
    'Respond in plain text, then include a final line starting with "SUGGESTIONS:" followed by 2-3 short follow-up prompts separated by | characters.'
  ]
    .filter(Boolean)
    .join('\n\n');
}

function parseReply(text) {
  const marker = 'SUGGESTIONS:';
  const markerIndex = text.lastIndexOf(marker);

  if (markerIndex === -1) {
    return {
      reply: text.trim(),
      suggestions: [
        'Recommend a beginner workout.',
        'Summarize my progress.',
        'Suggest a cardio routine.'
      ]
    };
  }

  const reply = text.slice(0, markerIndex).trim();
  const suggestions = text
    .slice(markerIndex + marker.length)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    reply,
    suggestions: suggestions.length
      ? suggestions
      : ['Recommend a beginner workout.', 'Summarize my progress.', 'Suggest a cardio routine.']
  };
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405, origin);
    }

    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: 'GEMINI_API_KEY is not configured.' }, 500, origin);
    }

    try {
      const { message = '', history = [] } = await request.json();
      if (!`${message}`.trim()) {
        return jsonResponse({ error: 'A message is required.' }, 400, origin);
      }

      const geminiPayload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(message, Array.isArray(history) ? history : []) }]
          }
        ]
      };

      const geminiResponse = await callGemini(env.GEMINI_API_KEY, geminiPayload);
      const rawText =
        geminiResponse?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim() ||
        'I could not generate a reply right now.';

      const parsed = parseReply(rawText);

      return jsonResponse(
        {
          reply: parsed.reply,
          suggestions: parsed.suggestions,
          usedTools: ['search_workout_library']
        },
        200,
        origin
      );
    } catch (error) {
      return jsonResponse(
        {
          error: error instanceof Error ? error.message : 'Unknown worker error.'
        },
        500,
        origin
      );
    }
  }
};
