import { useState, useEffect } from 'react';
import { adminApi, sectionApi } from '../../api/blogApi';
import { Card, Spinner, Input, Button, Badge } from '../../components/ui';
import { Plus, Edit3, Trash2, FolderOpen, ChevronDown, ChevronRight, Save, X, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSectionsPage = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState(null);
    const [subsections, setSubsections] = useState({});

    // Create / Edit modals
    const [sectionModal, setSectionModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', id, name, slug, sortOrder }
    const [subsectionModal, setSubsectionModal] = useState(null); // null | { mode: 'create', sectionId } | { mode: 'edit', id, name, slug, sortOrder }
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formSortOrder, setFormSortOrder] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    const loadSections = async () => {
        setLoading(true);
        try {
            const r = await sectionApi.getSections();
            setSections(r.data);
        } catch { toast.error('Failed to load sections'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadSections(); }, []);

    const loadSubsections = async (sectionSlug, sectionId) => {
        try {
            const r = await sectionApi.getSubsections(sectionSlug);
            setSubsections(prev => ({ ...prev, [sectionId]: r.data }));
        } catch { toast.error('Failed to load subsections'); }
    };

    const toggleSection = (sec) => {
        if (expandedSection === sec.id) {
            setExpandedSection(null);
        } else {
            setExpandedSection(sec.id);
            if (!subsections[sec.id]) {
                loadSubsections(sec.slug, sec.id);
            }
        }
    };

    // ---- Section CRUD ----
    const openCreateSection = () => {
        setSectionModal({ mode: 'create' });
        setFormName(''); setFormSlug(''); setFormSortOrder(0);
    };

    const openEditSection = (sec) => {
        setSectionModal({ mode: 'edit', id: sec.id });
        setFormName(sec.name); setFormSlug(sec.slug); setFormSortOrder(sec.sortOrder || 0);
    };

    const handleSaveSection = async () => {
        if (!formName.trim()) { toast.error('Name is required'); return; }
        setActionLoading(true);
        try {
            const payload = { name: formName, slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'), sortOrder: formSortOrder };
            if (sectionModal.mode === 'create') {
                await adminApi.createSection(payload);
                toast.success('Section created!');
            } else {
                await adminApi.updateSection(sectionModal.id, payload);
                toast.success('Section updated!');
            }
            setSectionModal(null);
            loadSections();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    const handleDeleteSection = async (id) => {
        if (!confirm('Delete this section and all its subsections?')) return;
        try {
            await adminApi.deleteSection(id);
            toast.success('Section deleted');
            loadSections();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    // ---- Subsection CRUD ----
    const openCreateSubsection = (sectionId) => {
        setSubsectionModal({ mode: 'create', sectionId });
        setFormName(''); setFormSlug(''); setFormSortOrder(0);
    };

    const openEditSubsection = (sub) => {
        setSubsectionModal({ mode: 'edit', id: sub.id });
        setFormName(sub.name); setFormSlug(sub.slug); setFormSortOrder(sub.sortOrder || 0);
    };

    const handleSaveSubsection = async () => {
        if (!formName.trim()) { toast.error('Name is required'); return; }
        setActionLoading(true);
        try {
            const payload = { name: formName, slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'), sortOrder: formSortOrder };
            if (subsectionModal.mode === 'create') {
                await adminApi.createSubsection({ ...payload, sectionId: subsectionModal.sectionId });
                toast.success('Subsection created!');
            } else {
                await adminApi.updateSubsection(subsectionModal.id, payload);
                toast.success('Subsection updated!');
            }
            setSubsectionModal(null);
            // Reload subsections for the expanded section
            if (expandedSection) {
                const sec = sections.find(s => s.id === expandedSection);
                if (sec) loadSubsections(sec.slug, sec.id);
            }
            loadSections(); // Refresh counts
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    const handleDeleteSubsection = async (id) => {
        if (!confirm('Delete this subsection?')) return;
        try {
            await adminApi.deleteSubsection(id);
            toast.success('Subsection deleted');
            if (expandedSection) {
                const sec = sections.find(s => s.id === expandedSection);
                if (sec) loadSubsections(sec.slug, sec.id);
            }
            loadSections();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    // ---- Render ----
    if (loading) return <div className="py-20"><Spinner size="lg" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Sections & Subsections</h1>
                    <p className="text-sm text-text-tertiary mt-1">Manage your content taxonomy</p>
                </div>
                <button onClick={openCreateSection}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-text-primary text-bg-primary hover:opacity-90 transition-all">
                    <Plus className="w-4 h-4" /> New Section
                </button>
            </div>

            {sections.length === 0 ? (
                <Card><p className="text-center text-text-tertiary py-8">No sections yet. Create your first one!</p></Card>
            ) : (
                <div className="space-y-3">
                    {sections.map((sec) => (
                        <Card key={sec.id}>
                            {/* Section row */}
                            <div className="flex items-center justify-between">
                                <button onClick={() => toggleSection(sec)}
                                    className="flex items-center gap-3 flex-1 text-left">
                                    {expandedSection === sec.id ? (
                                        <ChevronDown className="w-4 h-4 text-text-tertiary" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-text-tertiary" />
                                    )}
                                    <FolderOpen className="w-5 h-5 text-indigo-500" />
                                    <div>
                                        <h3 className="font-semibold text-text-primary">{sec.name}</h3>
                                        <p className="text-xs text-text-tertiary">/{sec.slug} · Order: {sec.sortOrder || 0}</p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="info">{sec.subsectionCount || 0} subs</Badge>
                                    <button onClick={() => openEditSection(sec)}
                                        className="p-2 rounded-lg hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-all" title="Edit">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteSection(sec.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-text-tertiary hover:text-red-500 transition-all" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Subsections (expanded) */}
                            {expandedSection === sec.id && (
                                <div className="mt-4 pl-12 space-y-2 border-t border-border-secondary pt-4">
                                    {(subsections[sec.id] || []).map((sub) => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border-secondary">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-purple-500" />
                                                <div>
                                                    <p className="font-medium text-text-primary text-sm">{sub.name}</p>
                                                    <p className="text-xs text-text-tertiary">/{sub.slug} · Order: {sub.sortOrder || 0}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEditSubsection(sub)}
                                                    className="p-1.5 rounded-lg hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-all">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteSubsection(sub.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-text-tertiary hover:text-red-500 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => openCreateSubsection(sec.id)}
                                        className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-600 font-medium py-2">
                                        <Plus className="w-4 h-4" /> Add Subsection
                                    </button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Section Modal */}
            {sectionModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSectionModal(null)}>
                    <div className="bg-bg-card rounded-2xl border border-border-primary shadow-2xl p-6 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text-primary mb-5">
                            {sectionModal.mode === 'create' ? 'Create Section' : 'Edit Section'}
                        </h2>
                        <div className="space-y-4">
                            <Input label="Name *" value={formName} onChange={(e) => {
                                setFormName(e.target.value);
                                if (sectionModal.mode === 'create') setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                            }} placeholder="e.g., Literature" />
                            <Input label="Slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="e.g., literature" />
                            <Input label="Sort Order" type="number" value={formSortOrder} onChange={(e) => setFormSortOrder(Number(e.target.value))} />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setSectionModal(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border-primary text-text-secondary hover:bg-bg-hover transition-colors">Cancel</button>
                            <button onClick={handleSaveSection} disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-text-primary text-bg-primary hover:opacity-90 transition-all disabled:opacity-50">
                                {actionLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Subsection Modal */}
            {subsectionModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSubsectionModal(null)}>
                    <div className="bg-bg-card rounded-2xl border border-border-primary shadow-2xl p-6 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text-primary mb-5">
                            {subsectionModal.mode === 'create' ? 'Create Subsection' : 'Edit Subsection'}
                        </h2>
                        <div className="space-y-4">
                            <Input label="Name *" value={formName} onChange={(e) => {
                                setFormName(e.target.value);
                                if (subsectionModal.mode === 'create') setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                            }} placeholder="e.g., Stories" />
                            <Input label="Slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="e.g., stories" />
                            <Input label="Sort Order" type="number" value={formSortOrder} onChange={(e) => setFormSortOrder(Number(e.target.value))} />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setSubsectionModal(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border-primary text-text-secondary hover:bg-bg-hover transition-colors">Cancel</button>
                            <button onClick={handleSaveSubsection} disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-text-primary text-bg-primary hover:opacity-90 transition-all disabled:opacity-50">
                                {actionLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
