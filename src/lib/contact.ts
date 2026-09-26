export const COUNTRY_CODES = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
export type ContactDetails = { firstName: string; lastName: string; country: string; street: string; addressLine2: string; city: string; region: string; postalCode: string };
export function parseContact(value: unknown): ContactDetails | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result: Record<string, string> = {};
  for (const [key, limit] of Object.entries({ firstName: 90, lastName: 90, country: 2, street: 200, addressLine2: 200, city: 100, region: 100, postalCode: 20 })) {
    const item = (value as Record<string, unknown>)[key];
    if (typeof item !== 'string' || item.trim().length > limit || (!item.trim() && !['addressLine2','region','postalCode'].includes(key))) return null;
    result[key] = item.trim();
  }
  if (!COUNTRY_CODES.includes(result.country)) return null;
  return result as ContactDetails;
}
