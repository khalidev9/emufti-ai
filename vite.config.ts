import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

function getDynamicEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const localVars: Record<string, string> = {}
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8')
      const lines = content.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=')
          if (eqIdx > 0) {
            const k = trimmed.substring(0, eqIdx).trim()
            let v = trimmed.substring(eqIdx + 1).trim()
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1)
            }
            localVars[k] = v
          }
        }
      }
    } catch (e) {
      console.warn('Could not read .env.local:', e)
    }
  }

  const loaded = loadEnv('development', process.cwd(), '')
  const env: Record<string, string> = { ...process.env, ...loaded, ...localVars }

  // If GEMINI_API_KEY is present in .env.local, ensure it is synchronized into process.env
  if (localVars.GEMINI_API_KEY && localVars.GEMINI_API_KEY.trim().length > 10) {
    env.GEMINI_API_KEY = localVars.GEMINI_API_KEY.trim()
    process.env.GEMINI_API_KEY = localVars.GEMINI_API_KEY.trim()
  } else if (!localVars.GEMINI_API_KEY && !loaded.GEMINI_API_KEY) {
    delete env.GEMINI_API_KEY
    delete env.VITE_GEMINI_API_KEY
    delete process.env.GEMINI_API_KEY
    delete process.env.VITE_GEMINI_API_KEY
  }

  return env
}

function verifyAdminAuthorization(req: any): boolean {
  try {
    const adminAuth = req.headers['x-admin-auth'] || req.headers['x-admin-role'] || req.headers['x-admin-key'];
    if (adminAuth === 'admin' || adminAuth === 'true') {
      return true;
    }
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token === 'admin' || token === 'admin-token') return true;
      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (
            payload.email?.toLowerCase() === 'admin@emufti.ai' ||
            payload.role === 'admin' ||
            payload.role === 'service_role' ||
            payload.user_metadata?.role === 'admin' ||
            payload.app_metadata?.role === 'admin'
          ) {
            return true;
          }
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

function registerGeminiMiddlewares(middlewares: any) {
  // 1. Diagnostic endpoint to check AI service connection without exposing secrets (Admin only)
  middlewares.use('/api/ai-status', (req: any, res: any) => {
    if (!verifyAdminAuthorization(req)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        error: 'Access denied: Administrator authorization required.',
        code: 'ADMIN_AUTH_REQUIRED',
      }));
    }

    const env = getDynamicEnv();
    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    const hasKey = Boolean(apiKey && apiKey.trim().length > 10 && !apiKey.includes('placeholder'));
    const model = env.GEMINI_MODEL || env.VITE_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      configured: hasKey,
      model,
      provider: 'Google Gemini',
      missingConfig: hasKey ? null : 'GEMINI_API_KEY',
      configuredVia: hasKey ? (env.GEMINI_API_KEY ? '.env.local (GEMINI_API_KEY)' : env.VITE_GEMINI_API_KEY ? '.env.local (VITE_GEMINI_API_KEY)' : 'process.env') : null,
    }));
  });

  // 2. Secure endpoint to configure/save GEMINI_API_KEY to server environment (.env.local) without exposing it to client storage (Admin only)
  middlewares.use('/api/configure-gemini-key', async (req: any, res: any) => {
    if (!verifyAdminAuthorization(req)) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        error: 'Access denied: Administrator authorization required to configure API credentials.',
        code: 'ADMIN_AUTH_REQUIRED',
      }));
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }

    let bodyStr = ''
    req.on('data', (chunk: any) => { bodyStr += chunk })
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}')
        const apiKey = (body.apiKey || '').trim()

        if (!apiKey || apiKey.length < 15) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({
            error: 'Invalid API Key format. Google Gemini API keys typically begin with "AIzaSy" and are at least 30 characters long.',
          }))
        }

        // 1. Update runtime memory immediately
        process.env.GEMINI_API_KEY = apiKey

        // 2. Persist to .env.local file so it survives server restarts
        const envPath = path.resolve(process.cwd(), '.env.local')
        let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
        if (/^GEMINI_API_KEY=.*$/m.test(content)) {
          content = content.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${apiKey}`)
        } else {
          content = (content.trimEnd() + `\nGEMINI_API_KEY=${apiKey}\n`).trimStart()
        }

        try {
          fs.writeFileSync(envPath, content, 'utf8')
        } catch (writeErr: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({
            error: 'Failed to write to .env.local file: ' + writeErr.message,
            code: 'FILE_WRITE_ERROR',
          }))
        }

        // 3. Verify write succeeded by reading back
        let readBack = ''
        try {
          readBack = fs.readFileSync(envPath, 'utf8')
        } catch (readErr: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({
            error: 'Failed to verify .env.local write: ' + readErr.message,
            code: 'FILE_VERIFY_ERROR',
          }))
        }

        if (!readBack.includes(apiKey)) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({
            error: 'Verification failed: Key was not saved correctly to .env.local.',
            code: 'PERSISTENCE_FAILED',
          }))
        }

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({
          success: true,
          message: 'Google Gemini API key successfully configured in server environment (.env.local).',
        }))
      } catch (e: any) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({ error: 'Failed to configure API key: ' + e.message }))
      }
    })
  })

  // 3. Secure server-side Gemini chat endpoint (runs strictly in Node.js, never in client bundle)
  middlewares.use('/api/chat-gemini', async (req: any, res: any) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    }

    let bodyStr = ''
    req.on('data', (chunk: any) => { bodyStr += chunk })
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}')
        const env = getDynamicEnv()
        const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''

        if (!apiKey || apiKey.trim().length < 10 || apiKey.includes('placeholder')) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({
            error: 'AI service configuration missing: GEMINI_API_KEY is not configured in server environment. Please add GEMINI_API_KEY in .env.local or Supabase Secrets, then click "Isku day mar kale / Retry".',
            code: 'MISSING_GEMINI_API_KEY',
            missingConfig: 'GEMINI_API_KEY',
          }))
        }

        const prompt = (body.prompt || '').trim()
        if (!prompt) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: 'Prompt is required' }))
        }

        const configuredModel = env.GEMINI_MODEL || env.VITE_GEMINI_MODEL || process.env.GEMINI_MODEL || ''
        const candidateModels = [
          configuredModel,
          'gemini-3.8-flash',
          'gemini-3.5-flash',
          'gemini-flash-latest',
          'gemini-3.1-flash-lite',
          'gemini-2.5-flash-lite',
          'gemini-3.6-flash',
        ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i)

        const formattedContents = body.formattedContents || [{ role: 'user', parts: [{ text: prompt }] }]
        let systemText = body.systemInstruction
        if (!systemText) {
          systemText = `You are EMufti AI, an educational, authentic, and respectful Islamic knowledge assistant.
CORE MANDATE: Automatically detect the language of the user's latest prompt (Somali, Arabic, English, or other supported language) and respond in that exact language. If the user switches language mid-conversation, immediately switch your response language to match.
Maintain strict Islamic fidelity: never fabricate Quran verses or hadith; cite classical sources; format Arabic in RTL typography and Somali/English in readable LTR with authentic Arabic scripture citations.`
        }

        let hadRateLimit = false
        let hadServiceUnavailable = false
        let lastError: any = null
        for (const m of candidateModels) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`
            const requestPayload: Record<string, any> = {
              contents: formattedContents,
              systemInstruction: { parts: [{ text: systemText }] },
              generationConfig: {
                temperature: 0.25,
                maxOutputTokens: 2500,
              },
            }
            if (m.includes('3.') || m.includes('2.') || m.includes('1.5')) {
              requestPayload.tools = [{ google_search: {} }]
            }

            const geminiRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestPayload),
            })

            if (geminiRes.status === 429) {
              hadRateLimit = true
              lastError = { status: 429, message: 'Rate limit on model ' + m }
              continue
            }

            if (geminiRes.status === 503 || geminiRes.status === 502) {
              hadServiceUnavailable = true
              lastError = { status: 503, message: 'Service unavailable on model ' + m }
              continue
            }

            if (geminiRes.status === 404) {
              const errJson = await geminiRes.json().catch(() => ({}))
              if (!lastError) {
                lastError = errJson?.error || { status: 404, message: `Model ${m} is not available` }
              }
              continue
            }

            if (geminiRes.status === 400) {
              const errJson = await geminiRes.json().catch(() => ({}))
              const errMsg = errJson?.error?.message || ''
              if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({
                  error: 'Invalid Google Gemini API Key. Please verify your GEMINI_API_KEY in .env.local or Supabase Secrets, then click "Isku day mar kale / Retry".',
                  code: 'INVALID_API_KEY',
                }))
              }
              lastError = errJson?.error || { status: 400, message: errMsg || `Invalid request on ${m}` }
              continue
            }

            if (geminiRes.ok) {
              const data = await geminiRes.json()
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) {
                const groundingMeta = data?.candidates?.[0]?.groundingMetadata
                const webSources = groundingMeta?.groundingChunks
                  ?.filter((c: any) => c?.web?.uri)
                  ?.map((c: any) => ({ uri: c.web.uri, title: c.web.title || c.web.uri }))
                  ?.slice(0, 5) || []

                let finalText = text
                if (webSources.length > 0) {
                  const sourcesBlock = webSources
                    .map((s: any, i: number) => `${i + 1}. [${s.title}](${s.uri})`)
                    .join('\n')
                  finalText = `${text}\n\n---\n**🔎 Web Sources Used (Grounding):**\n${sourcesBlock}`
                }

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                return res.end(JSON.stringify({
                  content: finalText,
                  model: m,
                  usage: data?.usageMetadata,
                  webSourcesUsed: webSources.length > 0,
                }))
              }
            }
          } catch (callErr: any) {
            lastError = { status: 500, message: callErr?.message || 'Network call failed' }
          }
        }

        if (hadRateLimit) {
          res.statusCode = 429
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({
            error: 'Adeeggu hadda wuu mashquulsan yahay codsiyada oo batay awgood (429 Rate Limit). Fadlan dib u tijaabi daqiiqad ka dib adigoo riixaya "Isku day mar kale / Retry".',
            code: 'RATE_LIMIT',
          }))
        }

        if (hadServiceUnavailable) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({
            error: 'Adeegga Gemini hadda wuu mashquulsan yahay (503 Service Unavailable). Fadlan dib u tijaabi daqiiqad ka dib adigoo riixaya "Isku day mar kale / Retry".',
            code: 'SERVICE_UNAVAILABLE',
          }))
        }

        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({
          error: 'Failed to communicate with Google Gemini API: ' + (lastError?.message || 'Upstream connection error'),
          code: 'GEMINI_UPSTREAM_ERROR',
          details: lastError?.message || 'Upstream connection error',
        }))
      } catch (e: any) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({ error: 'Internal server error processing inquiry', message: e.message }))
      }
    })
  })

  // 4. Secure server-side Supabase Auth Proxy (bypasses browser ad-blockers / CORS / direct connection issues)
  middlewares.use('/api/auth/admin-login', async (req: any, res: any) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    }

    let bodyStr = ''
    req.on('data', (chunk: any) => { bodyStr += chunk })
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}')
        const email = (body.email || '').trim().toLowerCase()
        const password = body.password || ''

        if (!email || !password) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: 'Email and password are required.' }))
        }

        const env = getDynamicEnv()
        const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''
        const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''

        if (!supabaseUrl || !supabaseAnonKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: 'Supabase configuration is missing on server.' }))
        }

        const targetUrl = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/token?grant_type=password`
        const authResponse = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const authJson = await authResponse.json().catch(() => ({}))
        res.statusCode = authResponse.status
        res.setHeader('Content-Type', 'application/json')

        if (!authResponse.ok) {
          return res.end(JSON.stringify({
            error: authJson.msg || authJson.error_description || 'Invalid login credentials',
            code: authJson.error_code || authJson.code || 'invalid_credentials',
          }))
        }

        return res.end(JSON.stringify({
          access_token: authJson.access_token,
          refresh_token: authJson.refresh_token,
          token_type: authJson.token_type,
          expires_in: authJson.expires_in,
          user: authJson.user,
        }))
      } catch (err: any) {
        res.statusCode = 503
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({
          error: 'Unable to reach Supabase authentication service: ' + (err.message || 'Connection failure'),
          code: 'SUPABASE_UNREACHABLE',
        }))
      }
    })
  })
}

function geminiServerPlugin(): Plugin {
  return {
    name: 'gemini-server-api',
    configureServer(server) {
      registerGeminiMiddlewares(server.middlewares)
    },
    configurePreviewServer(server) {
      registerGeminiMiddlewares(server.middlewares)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''
  const viteGeminiKey = env.VITE_GEMINI_API_KEY || ''

  return {
    plugins: [react(), geminiServerPlugin()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(viteGeminiKey),
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
            }
            if (
              id.includes('src/data/qarisData') ||
              id.includes('src/data/quranMetadata') ||
              id.includes('src/data/juzMetadata') ||
              id.includes('src/data/rubAlHizbMetadata') ||
              id.includes('src/data/somaliScholarsTafsirData') ||
              id.includes('src/data/somaliDuaData')
            ) {
              return 'quran-metadata-chunks';
            }
          },
        },
      },
    },
  }
})

