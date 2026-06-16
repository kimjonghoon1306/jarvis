// ONDA 힉스필드 중계 (CORS 우회) — Vercel 서버리스
// 브라우저 → 이 함수 → platform.higgsfield.ai. 키는 헤더로만 전달(저장 안 함).
export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','content-type,x-higgs-key');
  res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');
  if(req.method==='OPTIONS') return res.status(200).end();

  const key = req.headers['x-higgs-key'];          // "KEY_ID:KEY_SECRET"
  if(!key) return res.status(400).json({error:'API 키 없음'});
  const H = {
    'Authorization':'Key '+key,
    'User-Agent':'onda-server/1.0',
    'Content-Type':'application/json'
  };
  const BASE = 'https://platform.higgsfield.ai';

  const pass = async (r) => {
    const text = await r.text();
    res.status(r.status);
    try{ return res.json(JSON.parse(text)); }catch{ return res.json({raw:text, _status:r.status}); }
  };

  try{
    if(req.method==='POST'){
      const model = req.query.model || 'text2image_soul_v2';
      const body = typeof req.body==='string' ? req.body : JSON.stringify(req.body||{});
      const r = await fetch(`${BASE}/v1/${model}`, { method:'POST', headers:H, body });
      return pass(r);
    }
    if(req.method==='GET'){
      const id = req.query.id;
      if(!id) return res.status(400).json({error:'id 없음'});
      const r = await fetch(`${BASE}/v1/job-sets/${id}`, { headers:H });
      return pass(r);
    }
    return res.status(405).json({error:'method not allowed'});
  }catch(e){
    return res.status(502).json({error:'중계 실패: '+e.message});
  }
}
