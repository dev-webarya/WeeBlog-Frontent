import { useState, useEffect, useCallback, useRef } from 'react';
import { blogApi, sectionApi } from '../../api/blogApi';
import { Card, Input, TextArea, Button } from '../../components/ui';
import { ContentEditor } from '../../components/editor/ContentEditor';
import { PenTool, Mail, CheckCircle, ArrowRight, Save, Trash2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const DRAFT_KEY = 'blogpost_draft';

const emptyForm = {
    authorName: '', authorEmail: '', authorMobile: '',
    title: '', excerpt: '', content: '', tags: '', featuredImageUrl: '',
    sectionId: '', subsectionId: '',
};

export const SubmitBlogPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [otp, setOtp] = useState('');
    const [hasDraft, setHasDraft] = useState(false);
    const [draftSavedAt, setDraftSavedAt] = useState(null);
    const autoSaveTimer = useRef(null);
    const [sections, setSections] = useState([]);
    const [subsections, setSubsections] = useState([]);

    // Fetch sections on mount
    useEffect(() => {
        sectionApi.getSections().then(r => setSections(r.data)).catch(() => { });
    }, []);

    // Fetch subsections when section changes
    useEffect(() => {
        if (!formData.sectionId) { setSubsections([]); return; }
        const sec = sections.find(s => s.id === formData.sectionId);
        if (sec) {
            sectionApi.getSubsections(sec.slug).then(r => setSubsections(r.data)).catch(() => setSubsections([]));
        }
    }, [formData.sectionId, sections]);

    // Check for saved draft on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const draft = JSON.parse(saved);
                if (draft.formData && (draft.formData.title || draft.formData.content || draft.formData.excerpt)) {
                    setHasDraft(true);
                    setDraftSavedAt(draft.savedAt ? new Date(draft.savedAt) : null);
                }
            }
        } catch { /* ignore corrupt data */ }
    }, []);

    // Auto-save every 30 seconds when on step 1
    useEffect(() => {
        if (step !== 1) return;
        autoSaveTimer.current = setInterval(() => {
            const hasContent = formData.title || formData.content || formData.excerpt;
            if (hasContent) {
                saveDraft(true);
            }
        }, 30000);
        return () => clearInterval(autoSaveTimer.current);
    }, [step, formData]);

    const saveDraft = useCallback((silent = false) => {
        try {
            const draft = { formData, savedAt: new Date().toISOString() };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            setDraftSavedAt(new Date());
            setHasDraft(true);
            if (!silent) toast.success('Draft saved!');
        } catch {
            if (!silent) toast.error('Could not save draft');
        }
    }, [formData]);

    const restoreDraft = () => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const draft = JSON.parse(saved);
                setFormData(draft.formData);
                setHasDraft(false);
                toast.success('Draft restored!');
            }
        } catch { toast.error('Could not restore draft'); }
    };

    const discardDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setHasDraft(false);
        setDraftSavedAt(null);
        toast.success('Draft discarded');
    };

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDraftSavedAt(null);
    };

    const handleStep1 = async (e) => {
        e.preventDefault();
        if (!formData.sectionId) { toast.error('Please select a section'); return; }
        if (!formData.subsectionId) { toast.error('Please select a subsection'); return; }
        setLoading(true);
        try {
            await blogApi.startSubmission({
                authorName: formData.authorName, authorEmail: formData.authorEmail, authorMobile: formData.authorMobile,
                title: formData.title, excerpt: formData.excerpt, contentHtml: formData.content,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                featuredImageUrl: formData.featuredImageUrl || null,
                sectionId: formData.sectionId,
                subsectionId: formData.subsectionId,
            });
            toast.success('OTP sent to your email!'); setStep(2);
        } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
        finally { setLoading(false); }
    };

    const handleStep2 = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await blogApi.verifySubmission({ email: formData.authorEmail, otp });
            toast.success('Email verified!'); setStep(3);
        }
        catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
        finally { setLoading(false); }
    };

    const handleStep3 = async () => {
        setLoading(true);
        try {
            await blogApi.finishSubmission({ email: formData.authorEmail });
            clearDraft();
            toast.success('Blog submitted!'); setStep(4);
        }
        catch (err) { toast.error(err.response?.data?.message || 'Failed to finalize'); }
        finally { setLoading(false); }
    };

    const update = (f) => (e) => setFormData({ ...formData, [f]: e.target.value });

    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Submit Your Blog</h1>
            <p className="text-text-secondary mb-8">Share your knowledge. 3 simple steps.</p>

            {/* Draft restore banner */}
            {hasDraft && step === 1 && (
                <div className="mb-6 p-4 bg-bg-secondary border border-border-primary rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-text-secondary" />
                        <div>
                            <p className="text-sm font-medium text-text-primary">You have a saved draft</p>
                            {draftSavedAt && <p className="text-xs text-text-tertiary">Last saved at {formatTime(draftSavedAt)}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={restoreDraft} className="btn-primary text-xs py-1.5 px-4">Restore Draft</button>
                        <button onClick={discardDraft} className="btn-secondary text-xs py-1.5 px-4">Discard</button>
                    </div>
                </div>
            )}

            {/* Steps */}
            <div className="flex items-center justify-center gap-3 mb-10">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= s ? 'bg-text-primary text-bg-primary' : 'bg-bg-tertiary text-text-tertiary'
                            }`}>{step > s ? '✓' : s}</div>
                        {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-text-primary' : 'bg-border-primary'}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <Card>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-text-secondary" />
                            <h2 className="text-xl font-bold text-text-primary">Write Your Blog</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {draftSavedAt && (
                                <span className="text-xs text-text-tertiary hidden sm:inline">
                                    Saved {formatTime(draftSavedAt)}
                                </span>
                            )}
                            <button type="button" onClick={() => saveDraft(false)}
                                className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-tertiary hover:bg-bg-hover px-3 py-1.5 rounded-lg transition-colors"
                                title="Save as draft (auto-saves every 30s)">
                                <Save size={14} /> Save Draft
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleStep1} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Your Name *" placeholder="John Doe" value={formData.authorName} onChange={update('authorName')} required />
                            <Input label="Email *" type="email" placeholder="john@example.com" value={formData.authorEmail} onChange={update('authorEmail')} required />
                        </div>
                        <Input label="Mobile *" placeholder="+919876543210" value={formData.authorMobile} onChange={update('authorMobile')} required />

                        {/* Section & Subsection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Section *</label>
                                <select value={formData.sectionId}
                                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value, subsectionId: '' })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-border-primary bg-bg-primary text-text-primary text-sm outline-none focus:border-text-tertiary transition-colors"
                                    required>
                                    <option value="">Select a section</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Subsection *</label>
                                <select value={formData.subsectionId}
                                    onChange={(e) => setFormData({ ...formData, subsectionId: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-border-primary bg-bg-primary text-text-primary text-sm outline-none focus:border-text-tertiary transition-colors"
                                    required
                                    disabled={!formData.sectionId}>
                                    <option value="">{formData.sectionId ? 'Select a subsection' : 'Select section first'}</option>
                                    {subsections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <Input label="Blog Title *" placeholder="An amazing title..." value={formData.title} onChange={update('title')} required />
                        <TextArea label="Excerpt *" placeholder="Brief summary (2-3 sentences)" rows={2} value={formData.excerpt} onChange={update('excerpt')} required />

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">Content *</label>
                            <ContentEditor
                                initialContent={formData.content}
                                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                            />
                        </div>

                        <Input label="Tags (comma separated)" placeholder="spring-boot, java, tutorial" value={formData.tags} onChange={update('tags')} />
                        <Input label="Featured Image URL (optional)" placeholder="https://images.unsplash.com/..." value={formData.featuredImageUrl} onChange={update('featuredImageUrl')} />
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Sending OTP...' : 'Submit & Verify Email'} <ArrowRight className="w-4 h-4 inline ml-1" />
                        </Button>
                    </form>
                </Card>
            )}

            {step === 2 && (
                <Card className="text-center">
                    <Mail className="w-12 h-12 mx-auto text-text-tertiary mb-3" />
                    <h2 className="text-xl font-bold text-text-primary mb-1">Verify Your Email</h2>
                    <p className="text-text-secondary mb-6 text-sm">OTP sent to <strong>{formData.authorEmail}</strong></p>
                    <form onSubmit={handleStep2} className="max-w-xs mx-auto space-y-4">
                        <Input placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)}
                            className="text-center text-xl tracking-widest" maxLength={6} required />
                        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Verifying...' : 'Verify OTP'}</Button>
                    </form>
                </Card>
            )}

            {step === 3 && (
                <Card className="text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                    <h2 className="text-xl font-bold text-text-primary mb-1">Email Verified!</h2>
                    <p className="text-text-secondary mb-6 text-sm">Click below to submit for admin review</p>
                    <Button onClick={handleStep3} disabled={loading}>{loading ? 'Submitting...' : 'Finalize Submission'}</Button>
                </Card>
            )}

            {step === 4 && (
                <Card className="text-center">
                    <div className="text-5xl mb-3">🎉</div>
                    <h2 className="text-2xl font-bold text-text-primary mb-1">Blog Submitted!</h2>
                    <p className="text-text-secondary text-sm mb-6">Pending admin review. You'll get an email once approved.</p>
                    <Button variant="secondary" onClick={() => { setStep(1); setFormData(emptyForm); }}>
                        Submit Another
                    </Button>
                </Card>
            )}
        </div>
    );
};
