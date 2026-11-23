// Modo manutenção controlado pelo painel central (painel.html).
// Lê o interruptor controle/mapa/off no Firebase a cada acesso; se estiver
// ligado, responde 503 com a tela de manutenção. Se o Firebase não responder,
// o sistema fica no ar (falha aberta).

export const config = {
  // Ícones, a própria tela de manutenção, o 404 e o painel sempre passam.
  matcher: '/((?!icons/|C\\.png$|manutencao\\.html$|404\\.html$|painel\\.html$|painel\\.webmanifest$).*)',
};

const FLAG_URL = 'https://mapa-a4630-default-rtdb.firebaseio.com/controle/mapa/off.json';

export default async function middleware(request) {
  let off = false;
  try {
    const r = await fetch(FLAG_URL, { signal: AbortSignal.timeout(2500) });
    if (r.ok) off = (await r.json()) === true;
  } catch (_) { /* Firebase fora: segue no ar */ }

  if (!off) return; // sem resposta = segue para o arquivo normal

  const page = await fetch(new URL('/manutencao.html', request.url));
  return new Response(await page.text(), {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'retry-after': '3600',
      'cache-control': 'no-store',
    },
  });
}
