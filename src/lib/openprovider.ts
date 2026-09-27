import { normalizeDomain, DOMAIN_MANAGEMENT_USD, type DomainResult } from './domains';
let cachedToken: {value:string;expires:number} | undefined;
async function token() {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.value;
  if (process.env.OPENPROVIDER_API_TOKEN) return process.env.OPENPROVIDER_API_TOKEN;
  if (!process.env.OPENPROVIDER_USERNAME || !process.env.OPENPROVIDER_PASSWORD) throw new Error('Openprovider not configured');
  const r = await fetch('https://api.openprovider.eu/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:process.env.OPENPROVIDER_USERNAME,password:process.env.OPENPROVIDER_PASSWORD}),signal:AbortSignal.timeout(10000),cache:'no-store'});
  const data = await r.json();
  if (!r.ok || data.code !== 0 || typeof data.data?.token !== 'string') throw new Error('Openprovider authentication failed');
  cachedToken={value:data.data.token,expires:Date.now()+5*60*1000};
  return cachedToken.value;
}
export async function providerRequest(path:string,body:object) {
  const r=await fetch(`https://api.openprovider.eu/v1/${path}`,{method:'POST',headers:{Authorization:`Bearer ${await token()}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000),cache:'no-store'});
  const data=await r.json();
  if(!r.ok || data.code !== 0 || !data.data) throw new Error('Openprovider request failed');
  return data.data;
}
export async function checkDomains(domains:string[]): Promise<DomainResult[]> {
  if(!domains.length || domains.length > 15 || domains.some(domain=>!normalizeDomain(domain))) throw new Error('Invalid domain');
  const data=await providerRequest('domains/check',{domains:domains.map(domain=>({name:domain.split('.')[0],extension:domain.split('.')[1]})),with_price:true});
  return domains.map(name=>{
    const result=data.results?.find((r:{domain?:string})=>r.domain===name);
    const cost=result?.price?.reseller;
    const amount=Number(cost?.price);
    const premium=result?.is_premium===true || result?.is_premium===1 || result?.is_premium==='1' || Number(result?.premium?.price?.create || 0)>0;
    return {name,available:result?.status==='free',premium,price:cost?.currency==='USD' && Number.isFinite(amount) && amount>=0 && !premium ? Math.round((amount+DOMAIN_MANAGEMENT_USD)*100)/100 : null};
  });
}
export async function checkDomain(domain:string) { return (await checkDomains([domain]))[0]; }
