// GET /api/geo — the visitor's country, for showing prices in their currency.
// Vercel adds x-vercel-ip-country (ISO 3166-1 alpha-2) to every request; we only
// echo it back. Nothing is stored or logged, and no cookie is set.

export function GET(request) {
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase().slice(0, 2);
  return new Response(JSON.stringify({ country }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'private, no-store',
    },
  });
}
