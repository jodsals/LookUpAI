{
  "nodes": [
    {
      "parameters": {
        "jsCode": "// Hole die organischen Suchergebnisse\nconst results = $json.organic_results || [];\n\n// Reduziere auf max. 5 Ergebnisse\nconst topResults = results.slice(0, 5);\n\n// Gebe gefilterte Items zurück\nreturn topResults.map(r => ({\n  title: r.title,\n  link: r.link,\n  snippet: r.snippet\n}));\n"
      },
      "name": "Extract Links",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        336,
        80
      ],
      "id": "0200f23b-7a4a-49cf-8e04-1e46e160a160"
    },
    {
      "parameters": {
        "jsCode": "let text = \"\";\n\nfor (const item of $items()) {\n  text += `Title: ${item.json.title}\\n`;\n  text += `Link: ${item.json.link}\\n`;\n  text += `Summary: ${item.json.snippet}\\n`;\n  text += `\\n---------------------------\\n\\n`;\n}\n\nreturn [{\n  json: {\n    combined: text\n  }\n}];\n"
      },
      "name": "Combine Content",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        592,
        80
      ],
      "id": "09538861-24c5-4039-b538-d4e0015e3509"
    },
    {
      "parameters": {
        "operation": "duckduckgo",
        "q": "={{ $json.body.firstName }}{{ $json.body.lastName }}{{ $json.body.hint }}",
        "additionalFields": {},
        "requestOptions": {}
      },
      "type": "n8n-nodes-serpapi.serpApi",
      "typeVersion": 1,
      "position": [
        96,
        80
      ],
      "id": "b7e7eccd-3323-47f7-8da2-1e20ca921885",
      "name": "Duckduckgo search",
      "credentials": {
        "serpApi": {
          "id": "LgiFluVyTxT5Hxg9",
          "name": "SerpApi account"
        }
      }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://host.docker.internal:11434/api/generate",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "model",
              "value": "mistral:7b-instruct"
            },
            {
              "name": "prompt",
              "value": "={{ 'Erstelle aus den folgenden Informationen einen kurzen, sachlichen Personen-Steckbrief auf Deutsch (4–6 Sätze). Verwende ausschließlich die gegebenen Fakten, keine Spekulationen.\\n\\n' + $json.combined }}"
            },
            {
              "name": "stream",
              "value": "={{ false }}"
            }
          ]
        },
        "options": {}
      },
      "name": "Call LLM (Ollama)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [
        832,
        80
      ],
      "id": "2ce9790d-1e3d-4142-9816-bbe788164d99"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "start",
        "responseMode": "lastNode",
        "options": {
          "responseHeaders": {
            "entries": [
              {
                "name": "Access-Control-Allow-Origin",
                "value": "*"
              },
              {
                "name": "Access-Control-Allow-Headers",
                "value": "Content-Type"
              },
              {
                "name": "Access-Control-Allow-Methods",
                "value": "POST, OPTIONS"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          }
        }
      },
      "id": "f980c41a-44dd-48ba-bcc5-ed03e819de5c",
      "name": "Webhook (start)",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        -176,
        80
      ],
      "webhookMethods": {
        "POST": true,
        "OPTIONS": true
      },
      "webhookId": "db084caf-8249-4637-b1d7-7d76c9b2e73e"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}",
        "options": {
          "responseCode": 200,
          "responseHeaders": {
            "entries": [
              {
                "name": "Access-Control-Allow-Origin",
                "value": "*"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          }
        }
      },
      "id": "c97668db-2626-4813-b949-9f8cb07f15bb",
      "name": "Respond (JSON)",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        1264,
        80
      ]
    },
    {
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "/**\n * Eingänge:\n * - $json.response: Text vom Ollama (oder $json.body.response / Array[0].response)\n * - $json.links: Array der Top-Suchergebnisse [{title,link,snippet}]\n *\n * Ausgabe (genau im Frontend-Format):\n * {\n *   status: 'ok',\n *   data: {\n *     canonicalName,\n *     image: null,\n *     urls: { wikipedia: null },\n *     shortBio,\n *     facts: [{key,value,source}],\n *     confidence\n *   },\n *   message: 'Built from web search + LLM'\n * }\n */\n\n// ---------- 1) LLM-Text robust extrahieren ----------\nconst res = $json;\nlet llmText = null;\n\nif (typeof res?.response === 'string') {\n  llmText = res.response;\n} else if (Array.isArray(res) && typeof res[0]?.response === 'string') {\n  llmText = res[0].response;\n} else if (typeof res?.body === 'string') {\n  try {\n    const b = JSON.parse(res.body);\n    if (typeof b?.response === 'string') llmText = b.response;\n    else if (Array.isArray(b) && typeof b[0]?.response === 'string') llmText = b[0].response;\n  } catch {}\n} else if (res?.body && typeof res.body === 'object') {\n  const b = res.body;\n  if (typeof b?.response === 'string') llmText = b.response;\n  else if (Array.isArray(b) && typeof b[0]?.response === 'string') llmText = b[0].response;\n}\n\n// ---------- 2) Links aus vorherigem Node mitnehmen ----------\nconst links = Array.isArray(res?.links) ? res.links : [];\n\n// ---------- 3) Namen aus LLM-Text heuristisch ziehen ----------\nlet canonicalName = '';\nif (llmText) {\n  // z.B. \"Personenprofil: Donald John Trump\" am Anfang\n  const m = llmText.match(/^\\s*Personenprofil:\\s*([^\\n\\r]+)/i);\n  if (m) canonicalName = m[1].trim();\n}\n// Fallback: versuche aus combined Text den Namen (optional)\nif (!canonicalName && typeof res?.combined === 'string') {\n  const m2 = res.combined.match(/Title:\\s*([^\\n\\r]+)/);\n  if (m2) canonicalName = m2[1].trim();\n}\n\n// ---------- 4) Kurz-Bio setzen ----------\nconst shortBio = llmText?.trim() || null;\n\n// ---------- 5) Faktenliste bauen ----------\n/** @type {{key:string,value:string,source:string}[]} */\nconst facts = [];\nconst add = (k,v,s='Web') => { if (v !== null && v !== undefined && String(v).trim() !== '') facts.push({ key:k, value:String(v), source:s }); };\n\n// Optional: 1–3 Top-Links als Fakten\nfor (const r of links.slice(0, 3)) {\n  const title = r?.title || '';\n  const link  = r?.link  || '';\n  const snip  = r?.snippet || '';\n  if (link) add(`Quelle: ${title || 'Link'}`, link, 'Web');\n  if (snip) add('Snippet', snip, 'Web');\n}\n\n// ---------- 6) Confidence heuristisch ----------\nconst confidence = shortBio ? 0.75 : 0.5;\n\n// ---------- 7) Ergebnis zurückgeben ----------\nreturn {\n  json: {\n    status: 'ok',\n    data: {\n      canonicalName,\n      image: null,\n      urls: { wikipedia: null },\n      shortBio,\n      facts,\n      confidence\n    },\n    message: 'Built from web search + LLM'\n  }\n};"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1056,
        80
      ],
      "id": "e950759a-4df8-4489-92b9-d163e6ad6ed3",
      "name": "Code in JavaScript"
    }
  ],
  "connections": {
    "Extract Links": {
      "main": [
        [
          {
            "node": "Combine Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Combine Content": {
      "main": [
        [
          {
            "node": "Call LLM (Ollama)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Duckduckgo search": {
      "main": [
        [
          {
            "node": "Extract Links",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Call LLM (Ollama)": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook (start)": {
      "main": [
        [
          {
            "node": "Duckduckgo search",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Respond (JSON)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "f52f4d81c65fe7696820e7950d7550687c2516ba549991d3a2428259465063be"
  }
}