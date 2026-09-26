'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { EntityType } from '@/lib/formation';
import { getStateFilingTimes } from '@/lib/filing-times';

export const filingCopy = {
  en: { title: 'State filing time', remaining: '3 steps remaining', standard: 'Standard filing', expedited: 'Expedited filing', pending: 'Timing to be confirmed', fee: 'Price to be confirmed', included: 'No additional fee', unavailable: 'Not available for this formation', checking: 'Availability to be confirmed', note: 'Processing times and expedited options vary by state and entity. We will confirm the available options before filing.', estimate: 'Estimated formation date', unconfirmed: 'To be confirmed', intro: 'Choose your state and review the filing options. Expedited filing cannot be selected until its availability, timing and price are confirmed.' },
  es: { title: 'Plazo de constitución', remaining: 'Quedan 3 pasos', standard: 'Trámite estándar', expedited: 'Trámite acelerado', pending: 'Plazo por confirmar', fee: 'Precio por confirmar', included: 'Sin cargo adicional', unavailable: 'No disponible para esta constitución', checking: 'Disponibilidad por confirmar', note: 'Los plazos y las opciones de trámite acelerado varían según el estado y la entidad. Confirmaremos las opciones antes de presentar el trámite.', estimate: 'Fecha estimada de constitución', unconfirmed: 'Por confirmar', intro: 'Elegí el estado y revisá las opciones. El trámite acelerado podrá seleccionarse cuando se confirmen su disponibilidad, plazo y precio.' },
  pt: { title: 'Prazo de constituição', remaining: 'Faltam 3 etapas', standard: 'Trâmite padrão', expedited: 'Trâmite acelerado', pending: 'Prazo a confirmar', fee: 'Preço a confirmar', included: 'Sem custo adicional', unavailable: 'Indisponível para esta constituição', checking: 'Disponibilidade a confirmar', note: 'Os prazos e as opções variam por estado e entidade. Confirmaremos as opções antes do registro.', estimate: 'Data estimada de constituição', unconfirmed: 'A confirmar', intro: 'Escolha o estado e confira as opções. O trâmite acelerado depende da confirmação de disponibilidade, prazo e preço.' },
  fr: { title: 'Délai de création', remaining: '3 étapes restantes', standard: 'Dépôt standard', expedited: 'Dépôt accéléré', pending: 'Délai à confirmer', fee: 'Prix à confirmer', included: 'Sans frais supplémentaires', unavailable: 'Indisponible pour cette création', checking: 'Disponibilité à confirmer', note: 'Les délais et les options varient selon l’État et le type de société. Les options seront confirmées avant le dépôt.', estimate: 'Date de création estimée', unconfirmed: 'À confirmer', intro: 'Choisissez l’État et consultez les options. Le dépôt accéléré nécessite la confirmation de sa disponibilité, de son délai et de son prix.' },
  de: { title: 'Bearbeitungszeit', remaining: 'Noch 3 Schritte', standard: 'Standardbearbeitung', expedited: 'Expressbearbeitung', pending: 'Dauer noch zu bestätigen', fee: 'Preis noch zu bestätigen', included: 'Ohne Zusatzgebühr', unavailable: 'Für diese Gründung nicht verfügbar', checking: 'Verfügbarkeit noch zu bestätigen', note: 'Zeiten und Optionen variieren je nach Bundesstaat und Gesellschaftsform. Wir bestätigen die Optionen vor der Einreichung.', estimate: 'Voraussichtliches Gründungsdatum', unconfirmed: 'Noch zu bestätigen', intro: 'Wählen Sie den Bundesstaat und prüfen Sie die Optionen. Die Expressbearbeitung setzt bestätigte Verfügbarkeit, Dauer und Preise voraus.' },
  zh: { title: '州注册处理时间', remaining: '还剩3步', standard: '标准办理', expedited: '加急办理', pending: '处理时间待确认', fee: '价格待确认', included: '无额外费用', unavailable: '此注册类型不提供此服务', checking: '可用性待确认', note: '办理时间和加急选项因州和实体类型而异。我们将在提交前确认可用选项。', estimate: '预计成立日期', unconfirmed: '待确认', intro: '请选择州并查看办理选项。加急办理的可用性、时间和费用确认后方可选择。' },
};

export default function StateFilingTime({ state, entity }: { state: string; entity: EntityType }) {
  const { lang } = useLanguage();
  const copy = filingCopy[lang];
  const timing = getStateFilingTimes(state, entity);
  return <div className="filing-time">
    <p className="filing-intro">{copy.intro}</p>
    <p className="filing-location">{entity} · {state}</p>
    <div className="filing-options" role="radiogroup" aria-label={copy.title}>
      <label className="filing-option filing-option-pending">
        {timing?.expedited.availability !== 'unavailable' && <span className="filing-fast-badge" lang="en"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z" /></svg>FAST</span>}
        <div className="filing-option-header"><input type="radio" name="filing-speed" value="expedited" disabled /><span><strong>{copy.expedited}</strong><small>{timing?.expedited.availability === 'unavailable' ? copy.unavailable : copy.checking}</small></span></div>
        <div className="filing-option-body"><strong>{copy.pending}</strong><p>{copy.fee}</p><div>{copy.estimate}<span>{copy.unconfirmed}</span></div></div>
      </label>
      <label className="filing-option filing-option-selected">
        <div className="filing-option-header"><input type="radio" name="filing-speed" value="standard" checked readOnly /><span><strong>{copy.standard}</strong><small>{copy.included}</small></span></div>
        <div className="filing-option-body"><strong>{copy.pending}</strong><p>$0</p><div>{copy.estimate}<span>{copy.unconfirmed}</span></div></div>
      </label>
    </div>
    <p className="formation-note">{copy.note}</p>
  </div>;
}
