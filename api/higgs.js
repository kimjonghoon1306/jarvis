// ONDA 힉스필드 중계 (CORS 우회) — Vercel 서버리스 함수
// 브라우저 → 이 함수 → 힉스필드 API. 키는 브라우저가 헤더로 전달(저장 안 함).
export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','content-type,x-higgs-key');
  res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');
  if(req.method==='OPTIONS') return res.status(200).end();

  const key = req.headers['x-higgs-key'];
  if(!key) return res.status(400).json({error:'API 키 없음 (x-higgs-key 헤더)'});
  const H = { 'Authorization':'Bearer '+key, 'Content-Type':'application/json' };
  const BASE = 'https://api.higgsfield.ai';

  try{
    if(req.method==='POST'){
      // 생성 제출
      const body = typeof req.body==='string' ? req.body : JSON.stringify(req.body||{});
      const r = await fetch(BASE+'/v1/generations', { method:'POST', headers:H, body });
      const text = await r.text();
      res.status(r.status);
      try{ return res.json(JSON.parse(text)); }catch{ return res.send(text); }
    }
    if(req.method==='GET'){
      // 상태 폴링: /api/higgs?id=xxx
      const id = req.query.id;
      if(!id) return res.status(400).json({error:'id 없음'});
      const r = await fetch(`${BASE}/v1/generations/${id}`, { headers:H });
      const text = await r.text();
      res.status(r.status);
      try{ return res.json(JSON.parse(text)); }catch{ return res.send(text); }
    }
    return res.status(405).json({error:'method not allowed'});
  }catch(e){
    return res.status(502).json({error:'중계 실패: '+e.message});
  }
}
