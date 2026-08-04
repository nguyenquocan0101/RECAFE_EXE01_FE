import React, { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import * as storyApi from '@/services/api/adminProductStories';

interface CoffeeTypeManagerProps {
    onActiveTypesChanged: () => void;
}

const CoffeeTypeManager: React.FC<CoffeeTypeManagerProps> = ({ onActiveTypesChanged }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [types, setTypes] = useState<storyApi.CoffeeTypeOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', displayOrder: '10' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingForm, setEditingForm] = useState({ name: '', slug: '', displayOrder: '0' });
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            setTypes(await storyApi.getCoffeeTypes());
        } catch (requestError: any) {
            setError(requestError?.message || t('adminStory.catalogLoadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const create = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setSaving(true);
            const created = await storyApi.createCoffeeType({ ...form, displayOrder: Number(form.displayOrder) });
            setTypes(current => [...current, created].sort((left, right) => left.displayOrder - right.displayOrder));
            setForm({ name: '', slug: '', displayOrder: '10' });
            onActiveTypesChanged();
            showToast(t('adminStory.catalogCreated'), 'success');
        } catch (requestError: any) {
            showToast(requestError?.message || t('adminStory.genericError'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const saveEdit = async (id: string) => {
        try {
            setSaving(true);
            const updated = await storyApi.updateCoffeeType(id, { ...editingForm, displayOrder: Number(editingForm.displayOrder) });
            setTypes(current => current.map(item => item.id === id ? updated : item).sort((left, right) => left.displayOrder - right.displayOrder));
            setEditingId(null);
            onActiveTypesChanged();
            showToast(t('adminStory.catalogUpdated'), 'success');
        } catch (requestError: any) {
            showToast(requestError?.message || t('adminStory.genericError'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggle = async (type: storyApi.CoffeeTypeOption) => {
        try {
            const updated = await storyApi.setCoffeeTypeActive(type.id, !type.isActive);
            setTypes(current => current.map(item => item.id === type.id ? updated : item));
            onActiveTypesChanged();
        } catch (requestError: any) {
            showToast(requestError?.message || t('adminStory.genericError'), 'error');
        }
    };

    return (
        <section className="mt-8 rounded bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-2 border-b border-[#e8ddd5] pb-4 md:flex-row md:items-end md:justify-between">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#657b35]">{t('adminStory.catalogEyebrow')}</p><h2 className="mt-1 text-lg font-extrabold text-[#4b2311]">{t('adminStory.catalogTitle')}</h2></div>
                <p className="text-xs text-[#68361c]/60">{t('adminStory.catalogSubtitle')}</p>
            </div>
            <form onSubmit={create} className="grid gap-3 py-5 md:grid-cols-[1fr_1fr_110px_auto]">
                <input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder={t('adminStory.catalogName')} className="min-h-11 rounded border border-[#d9cbbd] px-3 text-sm focus:border-[#657b35] focus:outline-none" required />
                <input value={form.slug} onChange={event => setForm({ ...form, slug: event.target.value })} placeholder={t('adminStory.catalogSlug')} className="min-h-11 rounded border border-[#d9cbbd] px-3 font-mono text-xs focus:border-[#657b35] focus:outline-none" required />
                <input type="number" min="0" value={form.displayOrder} onChange={event => setForm({ ...form, displayOrder: event.target.value })} aria-label={t('adminStory.catalogOrder')} className="min-h-11 rounded border border-[#d9cbbd] px-3 text-sm focus:border-[#657b35] focus:outline-none" required />
                <Button type="submit" disabled={saving}>{t('adminStory.catalogAdd')}</Button>
            </form>
            {error && <div role="alert" className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">{error}</div>}
            <div className="divide-y divide-[#e8ddd5] border-y border-[#e8ddd5]">
                {loading ? <p className="py-6 text-sm text-[#68361c]/60">{t('adminStory.loading')}</p> : types.map(type => editingId === type.id ? (
                    <div key={type.id} className="grid gap-2 py-3 md:grid-cols-[1fr_1fr_100px_auto_auto]">
                        <input value={editingForm.name} onChange={event => setEditingForm({ ...editingForm, name: event.target.value })} className="min-h-10 rounded border border-[#d9cbbd] px-3 text-sm" />
                        <input value={editingForm.slug} onChange={event => setEditingForm({ ...editingForm, slug: event.target.value })} className="min-h-10 rounded border border-[#d9cbbd] px-3 font-mono text-xs" />
                        <input type="number" min="0" value={editingForm.displayOrder} onChange={event => setEditingForm({ ...editingForm, displayOrder: event.target.value })} className="min-h-10 rounded border border-[#d9cbbd] px-3 text-sm" />
                        <button type="button" onClick={() => void saveEdit(type.id)} className="min-h-10 rounded bg-[#657b35] px-3 text-xs font-bold text-white">{t('adminStory.save')}</button>
                        <button type="button" onClick={() => setEditingId(null)} className="min-h-10 rounded border border-[#d9cbbd] px-3 text-xs font-bold text-[#68361c]">{t('adminStory.cancel')}</button>
                    </div>
                ) : (
                    <div key={type.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div><span className="font-bold text-[#4b2311]">{type.name}</span><span className="ml-3 font-mono text-xs text-[#68361c]/55">{type.slug}</span></div>
                        <div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${type.isActive ? 'bg-[#f2f5eb] text-[#657b35]' : 'bg-[#f7f4f0] text-[#925f3c]'}`}>{type.isActive ? t('adminStory.activeStatus') : t('adminStory.inactiveStatus')}</span><button type="button" onClick={() => { setEditingId(type.id); setEditingForm({ name: type.name, slug: type.slug, displayOrder: String(type.displayOrder) }); }} className="min-h-10 rounded border border-[#d9cbbd] px-3 text-xs font-bold text-[#68361c]">{t('adminStory.edit')}</button><button type="button" onClick={() => void toggle(type)} className="min-h-10 rounded border border-[#d9cbbd] px-3 text-xs font-bold text-[#68361c]">{type.isActive ? t('adminStory.unpublish') : t('adminStory.publish')}</button></div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CoffeeTypeManager;
