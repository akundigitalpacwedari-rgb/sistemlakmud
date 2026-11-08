// Endpoint penyimpanan data LAKMUD. Dijalankan Vercel sebagai serverless function.
// Membutuhkan database Upstash/Vercel KV dan variabel LAKMUD_KODE (kode akses panitia).
const KEY = 'lakmud:state-v2';
const MAKS_BYTE = 900000;

function baseUrl() { return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL; }
function token() { return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN; }

async function perintah(args) {
  const r = await fetch(baseUrl(), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token(), 'content-type': 'application/json' },
    body: JSON.stringify(args),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function bacaBody(req) {
  if (req.body !== undefined && req.body !== null) {
    return Promise.resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
  }
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > MAKS_BYTE) reject(Object.assign(new Error('besar'), { code: 413 })); });
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  const kode = process.env.LAKMUD_KODE || process.env.LAKMUD_AKSES;
  if (!kode) return res.status(500).json({ error: 'konfigurasi' });
  if ((req.headers['x-akses'] || '') !== kode) return res.status(401).json({ error: 'akses' });
  if (!baseUrl() || !token()) return res.status(500).json({ error: 'database' });
  try {
    if (req.method === 'GET') {
      const raw = await perintah(['GET', KEY]);
      const parsed = raw ? JSON.parse(raw) : null;
      return res.status(200).json({ state: parsed ? parsed.state : null, savedAt: parsed ? parsed.savedAt : null });
    }
    if (req.method === 'PUT') {
      const body = await bacaBody(req);
      if (!body || !body.state || typeof body.state !== 'object') return res.status(400).json({ error: 'state' });
      const raw = JSON.stringify({ state: body.state, savedAt: body.savedAt || new Date().toISOString() });
      if (raw.length > MAKS_BYTE) return res.status(413).json({ error: 'besar' });
      await perintah(['SET', KEY, raw]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    return res.status(e && e.code === 413 ? 413 : 500).json({ error: 'server' });
  }
};
