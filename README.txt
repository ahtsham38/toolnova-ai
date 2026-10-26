TOOLNOVA STUDIO + OPENAI (NETLIFY)

This project keeps the Signature Nebula ToolNova page and adds a connected AI panel.

CURRENTLY IMPLEMENTED (when deployed and configured):
- AI Assistant (text)
- AI Writer (text)
- AI Code Helper (text)
- AI Image Generator (OpenAI image API)
- Video Prompt Studio (generates a prompt only; it does not render a video file)

IMPORTANT:
- Do not paste your OpenAI key into index.html or share it in chat.
- OpenAI API usage may incur charges. Set usage limits/alerts in the OpenAI Platform.
- This starter does not yet include strong per-user rate limiting or authentication. Before advertising it publicly, add rate limiting/abuse protection and consider a usage cap.
- Model availability depends on your OpenAI project. Defaults: gpt-4.1-mini for text and gpt-image-1 for images. You can override with OPENAI_TEXT_MODEL and OPENAI_IMAGE_MODEL in Netlify environment variables.

DEPLOY (recommended Git-connected Netlify deploy):
1. Extract the ZIP on your PC.
2. Create a private GitHub repository and upload the project files/folders (index.html, package.json, netlify.toml, netlify/functions/ai.js). Do not upload API keys.
3. In Netlify, choose Add new site -> Import an existing project, connect that repository, and deploy.
4. In Netlify site settings, open Environment variables and add:
   OPENAI_API_KEY = your OpenAI secret key
   Optionally: OPENAI_TEXT_MODEL = gpt-4.1-mini
   Optionally: OPENAI_IMAGE_MODEL = gpt-image-1
5. Trigger a new deploy after adding the variables.
6. Open the live site and test Assistant, Writer, Code Helper, then Image Generator.

If you already use novatool1.netlify.app, first make a backup / use a separate test site so the existing live website is not accidentally overwritten.

Video: OpenAI API integration here creates a video prompt. A real video file needs a compatible video-generation API/provider and separate secure integration.
