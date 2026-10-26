const OpenAI = require('openai');

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Use POST for AI requests.' }) };

  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'AI setup is not finished yet. Add OPENAI_API_KEY in Netlify site environment variables.' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Request body must be valid JSON.' }) }; }

  const action = String(payload.action || 'assistant');
  const prompt = String(payload.prompt || '').trim().slice(0, 5000);
  if (!prompt) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please enter a prompt first.' }) };

  // Basic request-size guard; add stronger rate limiting before a public launch.
  if (prompt.length < 2) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please enter a little more detail.' }) };

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (action === 'image') {
      const image = await openai.images.generate({
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
        prompt: prompt,
        size: '1024x1024'
      });
      const b64 = image.data && image.data[0] && image.data[0].b64_json;
      if (!b64) throw new Error('The image service did not return image data. Check model access and API billing.');
      return { statusCode: 200, headers, body: JSON.stringify({ image: `data:image/png;base64,${b64}` }) };
    }

    const modes = {
      assistant: 'You are ToolNova AI Assistant. Give helpful, clear, accurate answers. If uncertain, say so.',
      writer: 'You are ToolNova AI Writer. Create original, well-structured writing matching the user request. Do not invent factual sources.',
      code: 'You are ToolNova Code Helper. Explain code clearly, provide safe code examples, and point out assumptions or likely errors.',
      video: 'You are ToolNova Video Prompt Studio. Turn the user idea into a detailed, production-ready prompt for a separate video-generation tool. Include subject consistency, setting, action, camera movement, lighting, style, aspect ratio and negative constraints. Be clear that you are generating a prompt, not a video file.'
    };
    const instructions = modes[action] || modes.assistant;
    const response = await openai.responses.create({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-4.1-mini',
      instructions,
      input: prompt,
      max_output_tokens: 1200
    });
    const text = response.output_text || '';
    if (!text) throw new Error('The AI returned an empty response. Please try again.');
    return { statusCode: 200, headers, body: JSON.stringify({ text }) };
  } catch (err) {
    const status = err.status && Number(err.status) >= 400 && Number(err.status) < 600 ? Number(err.status) : 502;
    let message = 'AI request failed. Please try again in a moment.';
    if (status === 401) message = 'OpenAI rejected the API key. Check the key in Netlify environment variables.';
    else if (status === 429) message = 'OpenAI usage limit or billing limit reached. Check your API usage and billing.';
    else if (status === 400) message = 'The request or selected model was not accepted. Check model access and configuration.';
    else if (err.message && /image data|image service/i.test(err.message)) message = err.message;
    console.error('ToolNova AI error:', err.message || err);
    return { statusCode: status, headers, body: JSON.stringify({ error: message }) };
  }
};
