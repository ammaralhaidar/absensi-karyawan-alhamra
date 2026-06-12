import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key'

serve(async (req) => {
  const { employee_id, type } = await req.json()

  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: employee_id,
    type,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30,
    jti: crypto.randomUUID(),
  }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))

  const token = `${signingInput}.${encodedSignature}`

  return new Response(JSON.stringify({ token, expires_in: 30 }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
