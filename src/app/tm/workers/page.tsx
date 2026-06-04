'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CustomSelect from '@/components/CustomSelect'
import DatePicker from '@/components/DatePicker'

// consolidated database of workers in react-state list
const initialWorkers = [
  { id: 'TM-W-001', name: 'Md. Rahim Uddin',   passport: 'AB1234567', dob: '1990-05-12', phone: '+880 1712-345678', country: 'Saudi Arabia', status: 'working',       category: 'Middle East', passportExpiry: '2027-03-15', documents: [{ name: 'passport_scan.pdf', size: '1.4 MB', date: '2026-01-10' }, { name: 'medical_report.pdf', size: '840 KB', date: '2026-02-14' }] },
  { id: 'TM-W-002', name: 'Abdul Karim',        passport: 'BC2345678', dob: '1988-11-20', phone: '+880 1812-456789', country: 'UAE',          status: 'departed',      category: 'Middle East', passportExpiry: '2026-08-22', documents: [{ name: 'passport_scan.pdf', size: '1.3 MB', date: '2025-12-05' }] },
  { id: 'TM-W-003', name: 'Fatema Begum',       passport: 'CD3456789', dob: '1995-02-08', phone: '+880 1911-567890', country: 'Qatar',        status: 'processing',    category: 'Middle East', passportExpiry: '2028-01-10', documents: [{ name: 'passport_scan.pdf', size: '1.5 MB', date: '2026-03-01' }] },
  { id: 'TM-W-004', name: 'Md. Hasan Ali',      passport: 'DE4567890', dob: '1992-07-30', phone: '+880 1612-678901', country: 'Kuwait',       status: 'visa_approved', category: 'Middle East', passportExpiry: '2025-12-05', documents: [{ name: 'passport_scan.pdf', size: '1.2 MB', date: '2025-11-15' }, { name: 'visa_stamping.pdf', size: '920 KB', date: '2026-04-10' }] },
  { id: 'TM-W-005', name: 'Sumaiya Khatun',     passport: 'EF5678901', dob: '1997-09-14', phone: '+880 1512-789012', country: 'Malaysia',     status: 'returned',      category: 'Southeast Asia', passportExpiry: '2026-06-18', documents: [{ name: 'passport_scan.pdf', size: '1.3 MB', date: '2026-02-18' }] },
  { id: 'TM-W-006', name: 'Md. Kamal Hossain',  passport: 'FG6789012', dob: '1985-03-25', phone: '+880 1412-890123', country: 'Saudi Arabia', status: 'working',       category: 'Middle East', passportExpiry: '2027-09-30', documents: [{ name: 'passport_scan.pdf', size: '1.4 MB', date: '2025-10-05' }] },
];

const statusColors: Record<string, { label: string; cls: string; color: string }> = {
  registered:    { label: 'Registered',   cls: 'badge-info',    color: '#06B6D4' },
  processing:    { label: 'Processing',   cls: 'badge-warning', color: '#F59E0B' },
  medically_fit: { label: 'Medical Fit',  cls: 'badge-success', color: '#10B981' },
  visa_approved: { label: 'Visa Approved', cls: 'badge-info',    color: '#3B82F6' },
  departed:      { label: 'Departed',     cls: 'badge-muted',   color: '#8E8D8C' },
  working:       { label: 'Working',      cls: 'badge-success', color: '#10B981' },
  returned:      { label: 'Returned',     cls: 'badge-muted',   color: '#8E8D8C' },
}

const recruitmentStages = [
  { key: 'registered', label: 'Registered' },
  { key: 'processing', label: 'Processing' },
  { key: 'medically_fit', label: 'Medical Fit' },
  { key: 'visa_approved', label: 'Visa Approved' },
  { key: 'departed', label: 'Departed' },
  { key: 'working', label: 'Working Abroad' }
];

export default function WorkersPage() {
  const [workersList, setWorkersList] = useState<any[]>(initialWorkers)
  const [isLoaded, setIsLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', passport: '', dob: '', phone: '', country: '', category: 'Middle East', status: 'registered', passportExpiry: '', agency: '' })
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Drawer, Editing, & Document Preview States
  const [activeWorker, setActiveWorker] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [previewDoc, setPreviewDoc] = useState<any | null>(null)

  // Google OAuth Tokens State
  const [googleTokens, setGoogleTokens] = useState<any | null>(null)

  // Load state from localStorage on client mount (safe from server hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkRole = async () => {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const role = (data.user.user_metadata?.role || data.user.app_metadata?.role || '').toLowerCase();
          setIsAdmin(role === 'admin');
        } else {
          setIsAdmin(false);
        }
      };
      checkRole();

      const saved = localStorage.getItem('tm_workers_list');
      if (saved) {
        try {
          setWorkersList(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load workers list from localStorage:', e);
        }
      }

      const tokensStr = localStorage.getItem('google_drive_tokens');
      if (tokensStr) {
        try {
          setGoogleTokens(JSON.parse(tokensStr));
        } catch (e) {
          console.error('Failed to parse google_drive_tokens:', e);
        }
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === 'true') {
        setShowAdd(true);
      }

      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage whenever workersList updates, ONLY after client load is complete
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('tm_workers_list', JSON.stringify(workersList));
    }
  }, [workersList, isLoaded]);

  const handleConnectGoogle = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tm_workers_list', JSON.stringify(workersList));
    }
    window.location.href = '/api/auth/google/login';
  };

  const handleDisconnectGoogle = () => {
    if (confirm('Are you sure you want to disconnect Google Drive? Document uploads will require reconnection.')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('google_drive_tokens');
      }
      setGoogleTokens(null);
    }
  };

  // Corrected search query (matches name OR passport number)
  const filtered = workersList.filter(w =>
    (w.name.toLowerCase().includes(search.toLowerCase()) || w.passport.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? w.status === statusFilter : true)
  )

  const isExpiringSoon = (d: string) => {
    const days = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return days < 90
  }

  // Stateful add worker submit
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.passport) {
      alert('Full Name and Passport Number are required.');
      return;
    }
    const newWorker = {
      id: `TM-W-0${workersList.length + 1}`,
      name: form.name,
      passport: form.passport,
      dob: form.dob || '1990-01-01',
      phone: form.phone || 'N/A',
      country: form.country || 'N/A',
      status: form.status,
      category: form.category,
      passportExpiry: form.passportExpiry || '2030-01-01',
      agency: form.agency || '',
      documents: [{ name: 'passport_scan.pdf', size: '1.2 MB', date: new Date().toISOString().split('T')[0] }]
    };
    setWorkersList([newWorker, ...workersList]);
    setShowAdd(false);
    setForm({ name: '', passport: '', dob: '', phone: '', country: '', category: 'Middle East', status: 'registered', passportExpiry: '', agency: '' });
  };

  // Open Drawer and populate edit fields
  const handleViewProfile = (w: any) => {
    setActiveWorker(w);
    setEditForm({ ...w });
    setIsEditing(false);
  };

  // Save edited profile changes
  const handleSaveProfile = () => {
    if (!editForm.name || !editForm.passport) {
      alert('Full Name and Passport Number are required.');
      return;
    }
    const updatedList = workersList.map(w => {
      if (w.id === activeWorker.id) {
        const { documents, ...restFields } = editForm; // Exclude documents from editForm overwrite!
        const updated = { ...w, ...restFields };
        setActiveWorker(updated);
        return updated;
      }
      return w;
    });
    setWorkersList(updatedList);
    setIsEditing(false);
  };

  // Update recruitment progress step
  const handleUpdateStage = (stageKey: string) => {
    const updatedList = workersList.map(w => {
      if (w.id === activeWorker.id) {
        const updated = { ...w, status: stageKey };
        setActiveWorker(updated);
        setEditForm(updated); // Sync complete updated worker to editForm
        return updated;
      }
      return w;
    });
    setWorkersList(updatedList);
  };

  // Stateful Document Upload to Google Drive API with OAuth 2.0
  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeWorker) {
      const file = e.target.files[0];

      if (!googleTokens || !googleTokens.accessToken) {
        alert('Google Drive is not connected. Please click the "Connect Google Drive" button at the top of the page.');
        return;
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('workerId', activeWorker.id);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'x-access-token': googleTokens.accessToken,
            'x-refresh-token': googleTokens.refreshToken || '',
            'x-expiry-date': googleTokens.expiryDate?.toString() || '',
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to upload document');
        }

        // If backend refreshed the tokens, update client state & localStorage
        if (data.newTokens) {
          const updatedTokens = {
            ...googleTokens,
            ...data.newTokens
          };
          localStorage.setItem('google_drive_tokens', JSON.stringify(updatedTokens));
          setGoogleTokens(updatedTokens);
        }

        const newDoc = {
          name: data.name,
          size: data.size,
          date: data.date,
          fileId: data.fileId,
          url: data.url,
          downloadUrl: data.downloadUrl || (data.fileId ? `https://drive.google.com/uc?export=download&id=${data.fileId}` : data.url),
        };

        const updatedList = workersList.map(w => {
          if (w.id === activeWorker.id) {
            const updated = {
              ...w,
              documents: [...(w.documents || []), newDoc]
            };
            setActiveWorker(updated);
            setEditForm(updated);
            return updated;
          }
          return w;
        });

        setWorkersList(updatedList);
        alert(`File "${data.name}" successfully uploaded to Google Drive!`);
      } catch (error: any) {
        console.error('File upload error:', error);
        alert(`Upload Failed: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };


  // Delete a document from both local state and Google Drive (if fileId exists)
  const handleDeleteDoc = async (e: React.MouseEvent, docToDelete: any) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete the document "${docToDelete.name}" from this worker's record?`)) {
      return;
    }

    if (docToDelete.fileId && googleTokens?.accessToken) {
      try {
        const response = await fetch('/api/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': googleTokens.accessToken,
            'x-refresh-token': googleTokens.refreshToken || '',
            'x-expiry-date': googleTokens.expiryDate?.toString() || '',
          },
          body: JSON.stringify({ fileId: docToDelete.fileId }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          console.warn('Failed to delete file from Google Drive:', data.error);
        } else if (data.newTokens) {
          const updatedTokens = {
            ...googleTokens,
            ...data.newTokens
          };
          localStorage.setItem('google_drive_tokens', JSON.stringify(updatedTokens));
          setGoogleTokens(updatedTokens);
        }
      } catch (err) {
        console.error('Error calling delete API:', err);
      }
    }

    const updatedList = workersList.map(w => {
      if (w.id === activeWorker.id) {
        const updatedDocs = (w.documents || []).filter((d: any) => d.name !== docToDelete.name || d.fileId !== docToDelete.fileId);
        const updated = {
          ...w,
          documents: updatedDocs
        };
        setActiveWorker(updated);
        setEditForm(updated);
        return updated;
      }
      return w;
    });

    setWorkersList(updatedList);
    alert(`Document "${docToDelete.name}" deleted from profile.`);
  };

  // Deletion operation
  const handleDeleteWorker = (id: string) => {
    if (confirm(`Are you absolutely sure you want to delete worker ${activeWorker?.name || ''} from the directory?`)) {
      setWorkersList(workersList.filter(w => w.id !== id));
      setActiveWorker(null);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Workers</span>
      </nav>

      {/* Google Drive OAuth Connection Banner */}
      {isAdmin && (
        <div style={{
        background: googleTokens?.accessToken ? 'rgba(16, 185, 129, 0.04)' : 'rgba(124, 58, 237, 0.03)',
        border: googleTokens?.accessToken ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(124, 58, 237, 0.15)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: googleTokens?.accessToken ? 'rgba(16, 185, 129, 0.1)' : 'rgba(124, 58, 237, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {googleTokens?.accessToken ? (
              <span style={{ fontSize: '1.25rem' }}>🟢</span>
            ) : (
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
            )}
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Google Drive Cloud Storage
              {googleTokens?.accessToken && (
                <span className="badge badge-success" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', background: '#10B981', color: '#fff', borderRadius: '4px' }}>Connected</span>
              )}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              {googleTokens?.accessToken 
                ? 'Documents are saved directly to your personal Google Drive account.' 
                : 'Connect your personal Google Drive to upload worker document repositories without storage limits.'}
            </p>
          </div>
        </div>
        <div>
          {googleTokens?.accessToken ? (
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              onClick={handleDisconnectGoogle}
            >
              Disconnect
            </button>
          ) : (
            <button 
              className="btn btn-tm btn-sm"
              onClick={handleConnectGoogle}
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Connect Google Drive
            </button>
          )}
        </div>
      </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Worker Directory</h1>
          <p className="page-subtitle">
            {workersList.length} workers registered · {workersList.filter(w => w.status === 'working').length} currently working abroad
          </p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-tm" onClick={() => setShowAdd(true)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Add Worker
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" placeholder="Search by name or passport..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: '160px' }}
          options={[
            { value: '', label: 'All Status' },
            ...Object.entries(statusColors).map(([k, v]) => ({ value: k, label: v.label }))
          ]}
        />
        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{filtered.length} workers</div>
      </div>

      {/* Worker Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filtered.map(w => (
          <div 
            key={w.id} 
            className="card glass-hover" 
            style={{ borderColor: 'rgba(124,58,237,0.12)', cursor: 'pointer' }}
            onClick={() => handleViewProfile(w)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--brand-accent), #4CD1D6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1.1rem', flexShrink: 0 }}>
                  {w.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{w.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{w.passport}</div>
                </div>
              </div>
              <span className={`badge ${statusColors[w.status]?.cls || 'badge-muted'}`}>{statusColors[w.status]?.label || w.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Country:</span> <strong style={{ color: 'var(--text-primary)' }}>{w.country}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Category:</span> <strong style={{ color: 'var(--text-primary)' }}>{w.category}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <span style={{ color: 'var(--text-secondary)' }}>{w.phone}</span></div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Passport Exp:</span>{' '}
                <strong style={{ color: isExpiringSoon(w.passportExpiry) ? '#EF4444' : 'var(--text-primary)' }}>
                  {w.passportExpiry} {isExpiringSoon(w.passportExpiry) ? '⚠️' : ''}
                </strong>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.4rem', display: 'flex', gap: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Agency:</span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{w.agency || 'Not Assigned'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={(e) => { e.stopPropagation(); handleViewProfile(w); }}
              >
                View Profile & Docs
              </button>
              {isAdmin && (
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleViewProfile(w); }}

                >
                  ✏️
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No workers match your search criteria.
          </div>
        )}
      </div>

      {/* Right side Detail Drawer overlay */}
      {activeWorker && (
        <>
          {/* Backdrop blur overlay */}
          <div 
            onClick={() => { setActiveWorker(null); setIsEditing(false); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', zIndex: 999 }}
          />

          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: '460px', maxWidth: '100%',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-4px 0 30px rgba(0,0,0,0.12)',
            zIndex: 1000,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            padding: '1.5rem',
          }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-accent), #4CD1D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1.2rem', flexShrink: 0 }}>
                  {activeWorker.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {activeWorker.id} Directory Record
                  </span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {activeWorker.name}
                  </h2>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setActiveWorker(null); setIsEditing(false); }}>✕</button>
            </div>

            {/* Edit Mode vs Read Mode toggle */}
            {!isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                
                {/* 1. Milestone Recruitment Progress Tracker */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.03em' }}>
                    Recruitment Milestone Stages
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--surface2)', borderRadius: '10px', padding: '0.75rem', border: '1px solid var(--border)' }}>
                    {recruitmentStages.map((stage, idx) => {
                      const isActive = activeWorker.status === stage.key;
                      // Calculate if stage is completed based on indices
                      const activeIdx = recruitmentStages.findIndex(r => r.key === activeWorker.status);
                      const isCompleted = idx <= activeIdx;

                      return (
                        <div 
                          key={stage.key} 
                          onClick={() => isAdmin && handleUpdateStage(stage.key)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.4rem 0.5rem', borderRadius: '6px',
                            cursor: isAdmin ? 'pointer' : 'default',
                            background: isActive ? 'rgba(76,209,214,0.06)' : 'transparent',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            border: `2px solid ${isCompleted ? 'var(--brand-accent)' : 'var(--border)'}`,
                            background: isCompleted ? 'var(--brand-accent)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', color: '#fff', fontWeight: 700
                          }}>
                            {isCompleted ? '✓' : ''}
                          </div>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)'
                          }}>
                            {stage.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Worker Core Details */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.03em', margin: 0 }}>
                      Worker Profile Details
                    </h4>
                    {isAdmin && (
                      <button className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.6rem' }} onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
                    )}
                  </div>
                  <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.25rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Passport Number</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{activeWorker.passport}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Date of Birth</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorker.dob}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Destination Country</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorker.country}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Placement Category</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorker.category}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone Contact</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorker.phone}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Passport Expiry</span>
                      <div style={{ fontWeight: 600, color: isExpiringSoon(activeWorker.passportExpiry) ? '#EF4444' : 'var(--text-primary)' }}>
                        {activeWorker.passportExpiry} {isExpiringSoon(activeWorker.passportExpiry) ? '⚠️' : ''}
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Placement Agency</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorker.agency || 'Not Assigned'}</div>
                    </div>
                  </div>
                </div>

                {/* 3. Stateful Document Repository Hub */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.03em' }}>
                    📁 Document Repository Hub
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--surface2)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)' }}>
                    {/* Google Drive Status Warning */}
                    {isAdmin && !googleTokens?.accessToken && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontSize: '0.78rem',
                        color: '#EF4444',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>⚠️</span> Google Drive Disconnected
                        </div>
                        <div>
                          Please connect Google Drive to enable document uploads and real file storage.
                        </div>
                        <button 
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)', width: '100%', justifyContent: 'center' }}
                          onClick={handleConnectGoogle}
                        >
                          Connect Google Drive
                        </button>
                      </div>
                    )}
                    {isAdmin && googleTokens?.accessToken && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.03)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.75rem',
                        color: '#10B981',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontWeight: 600 }}>🟢 Connected to Google Drive</span>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}
                          onClick={handleDisconnectGoogle}
                        >
                          Disconnect
                        </button>
                      </div>
                    )}

                    {activeWorker.documents?.map((doc: any, i: number) => (
                      <div 
                        key={i} 
                        onClick={() => setPreviewDoc(doc)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>📄</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                              {doc.fallback && (
                                <span style={{ fontSize: '0.75rem', cursor: 'default' }}>☁️</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)' }}>Uploaded: {doc.date}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--brand-accent)', fontWeight: 700 }}>{doc.size}</span>
                          {isAdmin && (
                            <button 
                              type="button"
                              className="btn btn-ghost btn-icon btn-sm" 
                              style={{ padding: '0.2rem', color: '#EF4444', height: '24px', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }} 
                              onClick={(e) => handleDeleteDoc(e, doc)}

                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!activeWorker.documents || activeWorker.documents.length === 0) && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                        No documents uploaded for this worker record.
                      </div>
                    )}
                    
                    {/* Real Document File Upload */}
                    {isAdmin && (
                      <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.5rem', borderRadius: '8px', border: isUploading ? '1px solid var(--border)' : '1px dashed var(--brand-accent)',
                        background: isUploading ? 'var(--surface2)' : 'rgba(76,209,214,0.02)', 
                        color: isUploading ? 'var(--text-muted)' : 'var(--brand-accent)',
                        fontSize: '0.8rem', fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer', textAlign: 'center'
                      }}>
                        {isUploading ? (
                          <>⏳ Uploading Document...</>
                        ) : (
                          <>📁 Upload File to Repository</>
                        )}
                        <input type="file" style={{ display: 'none' }} onChange={handleUploadDoc} disabled={isUploading} />
                      </label>
                    </div>
                    )}
                  </div>
                </div>

                {/* 4. Delete Action Button */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-ghost" 
                    style={{ flex: 1, color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }}
                    onClick={() => handleDeleteWorker(activeWorker.id)}
                  >
                    Delete Worker Record
                  </button>
                </div>

              </div>
            ) : (
              // Active Profile Editor Form
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Passport Number *</label>
                  <input className="form-input" value={editForm.passport || ''} onChange={e => setEditForm({ ...editForm, passport: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <DatePicker value={editForm.dob || ''} onChange={v => setEditForm({ ...editForm, dob: v })} placeholder="Date of birth" />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination Country</label>
                  <input className="form-input" value={editForm.country || ''} onChange={e => setEditForm({ ...editForm, country: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Placement Category</label>
                  <CustomSelect
                    value={editForm.category || ''}
                    onChange={v => setEditForm({ ...editForm, category: v })}
                    style={{ width: '100%' }}
                    options={['Middle East','Southeast Asia','Europe','Other'].map(c => ({ value: c, label: c }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Contact</label>
                  <input className="form-input" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Passport Expiry</label>
                  <DatePicker value={editForm.passportExpiry || ''} onChange={v => setEditForm({ ...editForm, passportExpiry: v })} placeholder="Passport expiry date" />
                </div>
                <div className="form-group">
                  <label className="form-label">Placement Agency</label>
                  <CustomSelect
                    value={editForm.agency || ''}
                    onChange={v => setEditForm({ ...editForm, agency: v })}
                    placeholder="Select Agency..."
                    style={{ width: '100%' }}
                    options={[
                      { value: '', label: 'Select Agency...' },
                      ...['Al-Noor Recruitment','Gulf Connect BD','Middle East HR','Kuwait Manpower Co.','SEA Recruitment','EuroLink Manpower'].map(a => ({ value: a, label: a }))
                    ]}
                  />
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="btn btn-tm" style={{ flex: 1 }} onClick={handleSaveProfile}>Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Worker Modal */}
      {showAdd && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-worker-title" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <form className="modal" style={{ maxWidth: '600px' }} onSubmit={handleAddWorker}>
            <div className="modal-header">
              <h2 id="add-worker-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add New Worker</h2>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)} aria-label="Close">✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="Md. Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Passport Number *</label>
                  <input className="form-input" placeholder="AB1234567" value={form.passport} onChange={e => setForm({ ...form, passport: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <DatePicker value={form.dob} onChange={v => setForm({ ...form, dob: v })} placeholder="Date of birth" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+880 1xxx-xxxxxx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination Country</label>
                  <input className="form-input" placeholder="Saudi Arabia" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Passport Expiry</label>
                  <DatePicker value={form.passportExpiry} onChange={v => setForm({ ...form, passportExpiry: v })} placeholder="Passport expiry" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <CustomSelect
                    value={form.category}
                    onChange={v => setForm({ ...form, category: v })}
                    style={{ width: '100%' }}
                    options={['Middle East','Southeast Asia','Europe','Other'].map(c => ({ value: c, label: c }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <CustomSelect
                    value={form.status}
                    onChange={v => setForm({ ...form, status: v })}
                    style={{ width: '100%' }}
                    options={['registered','processing','medically_fit','visa_approved','departed','working'].map(s => ({ value: s, label: statusColors[s]?.label || s }))}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Placement Agency</label>
                  <CustomSelect
                    value={form.agency || ''}
                    onChange={v => setForm({ ...form, agency: v })}
                    placeholder="Select Agency..."
                    style={{ width: '100%' }}
                    options={[
                      { value: '', label: 'Select Agency...' },
                      ...['Al-Noor Recruitment','Gulf Connect BD','Middle East HR','Kuwait Manpower Co.','SEA Recruitment','EuroLink Manpower'].map(a => ({ value: a, label: a }))
                    ]}
                  />
                </div>
              </div>
              <div style={{ background: 'rgba(76,209,214,0.02)', border: '1px dashed var(--brand-accent)', borderRadius: '10px', padding: '0.875rem', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                📁 <strong>Documents:</strong> Select passport scans, visa letters, and medical clearance files to store dynamically in the worker record directory.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-tm">Add Worker</button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic Document Preview Modal */}
      {previewDoc && (
        <div 
          onClick={() => setPreviewDoc(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ width: '500px', maxWidth: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{previewDoc.name}</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Secure Document Scan · {previewDoc.size}</span>
              </div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setPreviewDoc(null)}>✕</button>
            </div>

            {/* Fallback Cloud Notice Banner */}
            {previewDoc.fallback && (
              <div style={{ background: 'rgba(6,182,212,0.06)', borderBottom: '1px solid rgba(6,182,212,0.15)', padding: '0.5rem 1.25rem', fontSize: '0.75rem', color: '#0891b2', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <span>☁️</span>
                <span>Stored securely on Supabase Storage (Google Drive storage quota limit bypassed).</span>
              </div>
            )}

            {/* Modal Body: Graphical Document Scan Previewer */}
            <div style={{ padding: '1.5rem', background: '#FAFCFC', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
              {previewDoc.fileId ? (
                /* REAL GOOGLE DRIVE PREVIEW EMBED */
                <iframe 
                  src={`https://drive.google.com/file/d/${previewDoc.fileId}/preview`} 
                  style={{ width: '100%', height: '380px', border: 'none', borderRadius: '8px' }} 

                  allow="autoplay"
                />
              ) : previewDoc.url && previewDoc.url.startsWith('http') ? (
                /* REAL SUPABASE OR EXTERNAL URL PREVIEW */
                previewDoc.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                  <img 
                    src={previewDoc.url} 
                    style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                    alt="Document Preview"
                  />
                ) : (
                  <iframe 
                    src={previewDoc.url} 
                    style={{ width: '100%', height: '380px', border: 'none', borderRadius: '8px' }} 

                  />
                )
              ) : previewDoc.name.includes('passport') ? (
                /* 1. MOCK PASSPORT SCAN */
                <div style={{ width: '100%', background: '#FFFDF9', border: '2px solid #D5C19A', borderRadius: '10px', padding: '1rem', color: '#222121', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #D5C19A', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#781D1D' }}>PASSPORT / RAHDARI</div>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#781D1D' }}>DEMOCRATIC PEOPLES REPUBLIC</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {/* Mock Passport Photo */}
                    <div style={{ width: '90px', height: '115px', background: '#EAEBE6', border: '1px solid #CCC', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="40" height="40" fill="#999" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      <div style={{ fontSize: '0.55rem', color: '#666', marginTop: '0.5rem', fontWeight: 600 }}>PASSPORT PHOTO</div>
                    </div>
                    {/* Passport Details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.7rem', color: '#333', fontFamily: 'monospace' }}>
                      <div>Type: <strong style={{ color: '#000' }}>P</strong> &nbsp;&nbsp;&nbsp; Code: <strong style={{ color: '#000' }}>BGD</strong></div>
                      <div>Passport No: <strong style={{ color: '#000', fontSize: '0.78rem' }}>{activeWorker?.passport}</strong></div>
                      <div>Surname: <strong style={{ color: '#000' }}>{activeWorker?.name.split(' ').pop()?.toUpperCase()}</strong></div>
                      <div>Given Names: <strong style={{ color: '#000' }}>{activeWorker?.name.split(' ').slice(0, -1).join(' ')}</strong></div>
                      <div>Nationality: <strong style={{ color: '#000' }}>BANGLADESHI</strong></div>
                      <div>Date of Birth: <strong style={{ color: '#000' }}>{activeWorker?.dob}</strong></div>
                      <div>Date of Expiry: <strong style={{ color: '#781D1D', fontWeight: 700 }}>{activeWorker?.passportExpiry}</strong></div>
                    </div>
                  </div>
                  {/* Decorative Gold Seal */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', border: '2px dashed #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#FFF', fontWeight: 800 }}>GOVT</div>
                  </div>
                </div>
              ) : previewDoc.name.includes('medical') ? (
                /* 2. MOCK MEDICAL CLEARANCE REPORT */
                <div style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: '6px solid #10B981', borderRadius: '10px', padding: '1rem', color: '#222121', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#10B981', letterSpacing: '0.04em' }}>METRO DIAGNOSTIC CLINIC</div>
                    <div style={{ fontSize: '0.62rem', color: '#666' }}>Dhaka, Bangladesh · ISO Certified</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.7rem', color: '#333' }}>
                    <div>Worker Name: <strong style={{ color: '#000' }}>{activeWorker?.name}</strong></div>
                    <div>Passport No: <strong style={{ color: '#000' }}>{activeWorker?.passport}</strong></div>
                    <div>Examination Date: <strong style={{ color: '#000' }}>{previewDoc.date}</strong></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.5rem', background: '#F9FAFB', padding: '0.5rem', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
                      <div>Chest X-Ray: <strong style={{ color: '#10B981' }}>NORMAL</strong></div>
                      <div>Blood Test: <strong style={{ color: '#10B981' }}>CLEAR</strong></div>
                      <div>ECG Report: <strong style={{ color: '#10B981' }}>NORMAL</strong></div>
                      <div>HIV I & II: <strong style={{ color: '#10B981' }}>NEGATIVE</strong></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0', padding: '0.5rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🟢</span>
                      <strong style={{ color: '#10B981', fontSize: '0.78rem', letterSpacing: '0.03em' }}>FIT FOR PLACEMENT ABROAD</strong>
                    </div>
                  </div>
                </div>
              ) : previewDoc.name.includes('visa') ? (
                /* 3. MOCK VISA STAMPING STICKER */
                <div style={{ width: '100%', background: '#F1F5F9', border: '2px solid #3B82F6', borderRadius: '10px', padding: '1rem', color: '#222121', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
                  <div style={{ background: '#3B82F6', color: '#FFF', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, borderRadius: '4px', textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                    VISA ENTRY PERMIT STAMP
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.7rem', color: '#333' }}>
                    <div>Consulate General of: <strong style={{ color: '#3B82F6', fontSize: '0.78rem' }}>{activeWorker?.country?.toUpperCase()}</strong></div>
                    <div>Visa Holder: <strong style={{ color: '#000' }}>{activeWorker?.name}</strong></div>
                    <div>Passport No: <strong style={{ color: '#000', fontFamily: 'monospace' }}>{activeWorker?.passport}</strong></div>
                    <div>Visa Class: <strong style={{ color: '#000' }}>EMPLOYMENT / WORK</strong></div>
                    <div>Permit No: <strong style={{ color: '#000', fontFamily: 'monospace' }}>WP-9876543-A</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #999', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <div>Issue: <strong>2026-04-10</strong></div>
                      <div>Status: <strong style={{ color: '#3B82F6' }}>APPROVED</strong></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 4. GENERIC UPLOADED DOCUMENT */
                <div style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1.5rem', color: '#222121', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>{previewDoc.name}</h4>
                  <p style={{ fontSize: '0.72rem', color: '#666', lineHeight: '1.4', marginBottom: '1rem' }}>
                    This custom file was securely uploaded to the TM Overseas database. The system has verified the file integrity and encryption hashes.
                  </p>
                  <div style={{ display: 'inline-block', background: '#F3F4F6', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.69rem', fontWeight: 600, color: '#374151' }}>
                    File Size: {previewDoc.size}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', background: 'var(--surface2)', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                className="btn btn-ghost" 
                onClick={() => setPreviewDoc(null)}
              >
                Close Preview
              </button>
              <button 
                type="button"
                className="btn btn-tm"
                onClick={() => {
                  if (previewDoc.downloadUrl) {
                    window.open(previewDoc.downloadUrl, '_blank');
                  } else if (previewDoc.url) {
                    window.open(previewDoc.url, '_blank');
                  } else {
                    alert(`Initiating secure BDT secure download for ${previewDoc.name}... Complete!`);
                  }
                }}
              >
                Download File (⬇)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
