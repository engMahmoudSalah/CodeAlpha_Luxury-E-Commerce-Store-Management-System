const B='https://fakhama.mahmodsalah.workers.dev';
const j=async(p,o={})=>{const r=await fetch(B+p,o);let b;try{b=await r.json()}catch{b={}};return{s:r.status,b}};
const email='ct'+Date.now()+'@example.com';
const reg=await j('/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Concurrency Test',email,password:'secret123'})});
console.log('register',reg.s);const T=reg.b.data.token;
const A={'content-type':'application/json',authorization:'Bearer '+T};
const dup=await j('/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'x',email,password:'secret123'})});console.log('dup register',dup.s);
const prods=(await j('/api/products?limit=100')).b.data.products;
const p=prods.filter(x=>x.stock>=3).sort((a,b)=>a.stock-b.stock)[0];
console.log('product',p.id,'stock',p.stock);
const cust={name:'T',email,address:'1 St',city:'Cairo',postalCode:'11511',phone:'0100'};
const mk=(qty,key)=>j('/api/orders',{method:'POST',headers:{...A,...(key?{'idempotency-key':key}:{})},body:JSON.stringify({customer:cust,items:[{productId:p.id,quantity:qty}]})});
// 1) 40 concurrent orders of 1 unit each
const res=await Promise.all(Array.from({length:40},()=>mk(1)));
const okc=res.filter(r=>r.s===201).length,conf=res.filter(r=>r.s===409).length;
const after=(await j('/api/products/'+p.id)).b.data.product.stock;
console.log('concurrent: created',okc,'rejected409',conf,'expected created',p.stock,'stock after',after);
// 2) idempotent replay x10 concurrently on a fresh unit (cancel first to free stock)
const orders=(await j('/api/orders',{headers:A})).b.data.orders;
// 3) concurrent double cancel of same order
const oid=orders[0].id;
const c=await Promise.all(Array.from({length:10},()=>j('/api/orders/'+oid+'/status',{method:'PUT',headers:A,body:JSON.stringify({status:'cancelled'})})));
const s1=(await j('/api/products/'+p.id)).b.data.product.stock;
console.log('10 concurrent cancels statuses',[...new Set(c.map(x=>x.s))],'stock after (expect 1)',s1);
const idem=await Promise.all(Array.from({length:10},()=>mk(1,'key-1')));
const ids=new Set(idem.map(r=>r.b.data&&r.b.data.order&&r.b.data.order.id));
const s2=(await j('/api/products/'+p.id)).b.data.product.stock;
console.log('10 same Idempotency-Key -> distinct orders',ids.size,'statuses',[...new Set(idem.map(x=>x.s))],'stock after (expect 0)',s2);
const all=(await j('/api/orders',{headers:A})).b.data.orders;
for(const o of all) if(o.status!=='cancelled') await j('/api/orders/'+o.id+'/status',{method:'PUT',headers:A,body:JSON.stringify({status:'cancelled'})});
console.log('restored stock',(await j('/api/products/'+p.id)).b.data.product.stock,'(was',p.stock+')');
