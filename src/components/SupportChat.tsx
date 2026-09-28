'use client';
import Script from 'next/script';
import { useLanguage } from '@/i18n/LanguageContext';
export default function SupportChat() {
  const {lang}=useLanguage();
  const baseUrl=process.env.NEXT_PUBLIC_CHATWOOT_URL;
  const websiteToken=process.env.NEXT_PUBLIC_CHATWOOT_TOKEN;
  if(!baseUrl || !websiteToken) return null;
  return <Script src={`${baseUrl}/packs/js/sdk.js`} strategy="lazyOnload" onReady={()=>{
    const chatWindow=window as typeof window & {chatwootSettings?:object;chatwootSDK?:{run:(options:object)=>void};$chatwoot?:unknown};
    if(chatWindow.$chatwoot)return;
    chatWindow.chatwootSettings={position:'right',locale:lang,type:'standard',launcherTitle:lang==='es'?'Soporte':'Support'};
    chatWindow.chatwootSDK?.run({websiteToken,baseUrl});
  }}/>;
}
