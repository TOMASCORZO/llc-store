'use client';

import { useId } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { DEFAULT_STATE, EntityType, getStates } from '@/lib/formation';

export default function FormationSelector({ entity, state, onChange }: {
  entity: EntityType;
  state: string;
  onChange: (entity: EntityType, state: string) => void;
}) {
  const { t } = useLanguage();
  const id = useId();
  return <div className="formation-selector">
    <div className="form-group">
      <label htmlFor={`${id}-entity`}>{t('catalog.entity')}</label>
      <select id={`${id}-entity`} value={entity} onChange={event => {
        const next = event.target.value as EntityType;
        onChange(next, getStates(next).includes(state) ? state : DEFAULT_STATE);
      }}>
        <option value="LLC">LLC</option>
        <option value="S-Corp">S Corp</option>
      </select>
    </div>
    <div className="form-group">
      <label htmlFor={`${id}-state`}>{t('catalog.state')}</label>
      <select id={`${id}-state`} value={state} onChange={event => onChange(entity, event.target.value)}>
        {getStates(entity).map(name => <option key={name} value={name}>{name}</option>)}
      </select>
    </div>
    {entity === 'S-Corp' && <p className="formation-note">{t('catalog.eligibility')}</p>}
  </div>;
}
