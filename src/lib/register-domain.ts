import { supabaseAdmin } from './supabase';
import { checkDomain, providerRequest } from './openprovider';

// Atomic claim prevents duplicate billable calls. Uncertain provider responses are
// held for manual reconciliation; never blindly retry a registration.
export async function registerPaidDomain(orderId:string) {
  const {data:order,error}=await supabaseAdmin.from('orders').update({domain_status:'registering'}).eq('id',orderId).eq('status','paid').eq('domain_status','pending_payment').select('id,domain_registration,contact_details,customer_email,domain_fee_usd').maybeSingle();
  if(error) throw new Error('Unable to claim domain');
  if(!order) return;
  try {
    const domain=order.domain_registration;
    const contact=order.contact_details;
    const availability=await checkDomain(domain.name);
    if(!availability.available || availability.premium || availability.price === null || availability.price > Number(order.domain_fee_usd)) throw new Error('Domain no longer available');
    const customer=await providerRequest('customers',{
      name:{first_name:contact.firstName,last_name:contact.lastName},email:order.customer_email,
      address:{street:domain.street,number:domain.number,suffix:contact.addressLine2,zipcode:contact.postalCode,city:contact.city,country:contact.country,state:contact.region},
      phone:{country_code:domain.phoneCountry,area_code:domain.phoneArea,subscriber_number:domain.phoneNumber},
      comments:`Just My LLC order ${orderId}`
    });
    if(typeof customer.handle!=='string') throw new Error('Missing customer handle');
    const saved=await supabaseAdmin.from('orders').update({domain_customer_handle:customer.handle}).eq('id',orderId);
    if(saved.error) throw new Error('Unable to save contact handle');
    const result=await providerRequest('domains',{domain:{name:domain.name.split('.')[0],extension:domain.name.split('.')[1]},period:1,owner_handle:customer.handle,admin_handle:customer.handle,tech_handle:customer.handle,billing_handle:customer.handle,ns_group:'dns-openprovider',autorenew:'off'});
    if(!result.id || !['ACT','REQ'].includes(result.status)) throw new Error('Unconfirmed registration');
    const completed=await supabaseAdmin.from('orders').update({domain_status:result.status==='ACT'?'registered':'requested',domain_provider_id:String(result.id)}).eq('id',orderId);
    if(completed.error) throw new Error('Unable to save registration');
  } catch {
    const result=await supabaseAdmin.from('orders').update({domain_status:'needs_review'}).eq('id',orderId);
    if(result.error) throw new Error('Domain reconciliation required');
  }
}
