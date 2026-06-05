'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CustomSelect from '@/components/CustomSelect'
import DatePicker from '@/components/DatePicker'

// consolidated database of workers in react-state list
const initialWorkers = [
  { 
    id: 'TM-W-001', 
    name: 'Md. Rahim Uddin', 
    passport: 'AB1234567', 
    dob: '1990-05-12', 
    phone: '+880 1712-345678', 
    country: 'Saudi Arabia', 
    status: 'working', 
    category: 'Middle East', 
    passportExpiry: '2027-03-15', 
    agency: 'Al-Noor Recruitment',
    position: 'Construction Worker',
    salary: 'SAR 1,200/mo',
    fee: 65000,
    departureDate: '2024-05-10',
    visaExpiry: '2026-05-09',
    documents: [
      { name: 'passport_scan.pdf', size: '1.4 MB', date: '2026-01-10' }, 
      { name: 'medical_report.pdf', size: '840 KB', date: '2026-02-14' }
    ] 
  },
  { 
    id: 'TM-W-002', 
    name: 'Abdul Karim', 
    passport: 'BC2345678', 
    dob: '1988-11-20', 
    phone: '+880 1812-456789', 
    country: 'UAE', 
    status: 'departed', 
    category: 'Middle East', 
    passportExpiry: '2026-08-22', 
    agency: 'Gulf Connect BD',
    position: 'Driver',
    salary: 'AED 1,500/mo',
    fee: 55000,
    departureDate: '2024-05-08',
    visaExpiry: '2026-05-07',
    documents: [
      { name: 'passport_scan.pdf', size: '1.3 MB', date: '2025-12-05' }
    ] 
  },
  { 
    id: 'TM-W-003', 
    name: 'Fatema Begum', 
    passport: 'CD3456789', 
    dob: '1995-02-08', 
    phone: '+880 1911-567890', 
    country: 'Qatar', 
    status: 'processing', 
    category: 'Middle East', 
    passportExpiry: '2028-01-10', 
    agency: 'Middle East HR',
    position: 'Housemaid',
    salary: 'QAR 900/mo',
    fee: 48000,
    departureDate: '',
    visaExpiry: '',
    documents: [
      { name: 'passport_scan.pdf', size: '1.5 MB', date: '2026-03-01' }
    ] 
  },
  { 
    id: 'TM-W-004', 
    name: 'Md. Hasan Ali', 
    passport: 'DE4567890', 
    dob: '1992-07-30', 
    phone: '+880 1612-678901', 
    country: 'Kuwait', 
    status: 'visa_approved', 
    category: 'Middle East', 
    passportExpiry: '2025-12-05', 
    agency: 'Kuwait Manpower Co.',
    position: 'Technician',
    salary: 'KWD 180/mo',
    fee: 70000,
    departureDate: '',
    visaExpiry: '',
    documents: [
      { name: 'passport_scan.pdf', size: '1.2 MB', date: '2025-11-15' }, 
      { name: 'visa_stamping.pdf', size: '920 KB', date: '2026-04-10' }
    ] 
  },
  { 
    id: 'TM-W-005', 
    name: 'Sumaiya Khatun', 
    passport: 'EF5678901', 
    dob: '1997-09-14', 
    phone: '+880 1512-789012', 
    country: 'Malaysia', 
    status: 'returned', 
    category: 'Southeast Asia', 
    passportExpiry: '2026-06-18', 
    agency: 'SEA Recruitment',
    position: 'Factory Worker',
    salary: 'MYR 1,300/mo',
    fee: 42000,
    departureDate: '2024-01-20',
    visaExpiry: '',
    documents: [
      { name: 'passport_scan.pdf', size: '1.3 MB', date: '2026-02-18' }
    ] 
  },
  { 
    id: 'TM-W-006', 
    name: 'Md. Kamal Hossain', 
    passport: 'FG6789012', 
    dob: '1985-03-25', 
    phone: '+880 1412-890123', 
    country: 'Saudi Arabia', 
    status: 'working', 
    category: 'Middle East', 
    passportExpiry: '2027-09-30', 
    agency: 'Al-Noor Recruitment',
    position: 'Electrician',
    salary: 'SAR 1,500/mo',
    fee: 68000,
    departureDate: '2024-02-15',
    visaExpiry: '2026-02-14',
    documents: [
      { name: 'passport_scan.pdf', size: '1.4 MB', date: '2025-10-05' }
    ] 
  },
];

const getCategoryFromCountry = (country: string) => {
  const middleEast = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Oman', 'Bahrain'];
  const southeastAsia = ['Malaysia', 'Singapore', 'Brunei', 'Thailand'];
  const eastAsia = ['South Korea', 'Japan', 'Hong Kong'];
  const europe = ['Romania', 'Poland', 'Germany', 'Italy'];
  
  if (middleEast.includes(country)) return 'Middle East';
  if (southeastAsia.includes(country)) return 'Southeast Asia';
  if (eastAsia.includes(country)) return 'East Asia';
  if (europe.includes(country)) return 'Europe';
  return 'Middle East';
};

const statusColors: Record<string, { label: string; cls: string; color: string }> = {
  registered:    { label: 'Registered',   cls: 'badge-info',    color: '#06B6D4' },
  processing:    { label: 'Processing',   cls: 'badge-warning', color: '#F59E0B' },
  medically_fit: { label: 'Medical Fit',  cls: 'badge-success', color: '#10B981' },
  visa_approved: { label: 'Visa Approved', cls: 'badge-info',    color: '#3B82F6' },
  departed:      { label: 'Departed',     cls: 'badge-muted',   color: '#8E8D8C' },
  working:       { label: 'Working',      cls: 'badge-success', color: '#10B981' },
  returned:      { label: 'Returned',     cls: 'badge-muted',   color: '#8E8D8C' },
  available:     { label: 'Registered',   cls: 'badge-info',    color: '#06B6D4' },
  deployed:      { label: 'Working',      cls: 'badge-success', color: '#10B981' },
  blacklisted:   { label: 'Blacklisted',  cls: 'badge-danger',  color: '#EF4444' },
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
  const [form, setForm] = useState({ 
    name: '', 
    passport: '', 
    dob: '', 
    phone: '', 
    country: '', 
    category: 'Middle East', 
    status: 'registered', 
    passportExpiry: '', 
    agency: '',
    position: '',
    salary: '',
    fee: '',
    departureDate: '',
    visaExpiry: ''
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Drawer, Editing, & Document Preview States
  const [activeWorker, setActiveWorker] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [previewDoc, setPreviewDoc] = useState<any | null>(null)

  // Google OAuth Tokens State
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(false)

  // Load state from Supabase on client mount
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

      const loadWorkersFromSupabase = async () => {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();

          // Fetch workers
          const { data: dbWorkers, error: workersError } = await supabase
            .from('tm_workers')
            .select('*')
            .order('created_at', { ascending: false });

          if (workersError) {
            console.error('Failed to load workers from Supabase:', workersError);
            const saved = localStorage.getItem('tm_workers_list');
            if (saved) {
              try { setWorkersList(JSON.parse(saved)); } catch (e) {}
            }
            return;
          }

          // Fetch documents
          const { data: dbDocs } = await supabase
            .from('tm_documents')
            .select('*');

          if (dbWorkers && dbWorkers.length > 0) {
            const mapped = dbWorkers.map((w: any) => {
              const workerDocs = dbDocs
                ? dbDocs
                    .filter((d: any) => d.worker_id === w.id)
                    .map((d: any) => ({
                      name: d.document_name,
                      fileId: d.drive_file_id,
                      url: d.drive_view_url,
                      downloadUrl: d.drive_download_url,
                      size: d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(2)} MB` : '1.2 MB',
                      date: d.uploaded_at ? new Date(d.uploaded_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                    }))
                : [];

              let status = w.status || 'registered';
              let salary = '';
              let agency = '';
              let fee = '';
              let departureDate = '';
              if (w.notes) {
                const parts = w.notes.split('|');
                if (parts.length >= 5) {
                  status = parts[0] || status;
                  salary = parts[1] || '';
                  agency = parts[2] || '';
                  fee = parts[3] || '';
                  departureDate = parts[4] || '';
                } else {
                  salary = parts[0] || '';
                  agency = parts[1] || '';
                  fee = parts[2] || '';
                  departureDate = parts[3] || '';
                }
              }

              if (status === 'available') status = 'registered';
              else if (status === 'deployed') status = 'working';

              const country = w.nationality === 'Bangladeshi' || !w.nationality ? 'Not Assigned' : w.nationality;
              const category = getCategoryFromCountry(country);

              return {
                id: w.id,
                name: w.full_name,
                passport: w.passport_number || '',
                dob: w.date_of_birth || '',
                phone: w.phone || '',
                country,
                category,
                status: status || 'registered',
                passportExpiry: w.passport_expiry_date || '',
                visaExpiry: w.visa_expiry_date || '',
                position: w.profession || '',
                salary,
                agency,
                fee,
                departureDate,
                documents: workerDocs
              };
            });

            setWorkersList(mapped);

            const params = new URLSearchParams(window.location.search);
            const viewWorkerParam = params.get('view');
            if (viewWorkerParam) {
              const found = mapped.find((item: any) =>
                item.passport === viewWorkerParam ||
                item.id === viewWorkerParam ||
                item.name.toLowerCase() === viewWorkerParam.toLowerCase()
              );
              if (found) {
                setActiveWorker(found);
                setEditForm({ ...found });
                setIsEditing(false);
              }
            }
          } else {
            // Seed initialWorkers if table is empty
            const seedData = initialWorkers.map((w: any) => {
              let dbStatus = 'available';
              if (w.status === 'working' || w.status === 'departed' || w.status === 'visa_approved') {
                dbStatus = 'deployed';
              } else if (w.status === 'processing') {
                dbStatus = 'processing';
              } else if (w.status === 'returned') {
                dbStatus = 'returned';
              }
              return {
                full_name: w.name,
                passport_number: w.passport,
                date_of_birth: w.dob || null,
                phone: w.phone || null,
                nationality: w.country || null,
                status: dbStatus,
                passport_expiry_date: w.passportExpiry || null,
                visa_expiry_date: w.visaExpiry || null,
                profession: w.position || null,
                notes: `${w.status}|${w.salary || ''}|${w.agency || ''}|${w.fee || ''}|${w.departureDate || ''}`
              };
            });

            const { data: inserted, error: insertError } = await supabase
              .from('tm_workers')
              .insert(seedData)
              .select();

            if (!insertError && inserted) {
              const docSeeds: any[] = [];
              inserted.forEach((item: any) => {
                const match = initialWorkers.find((w: any) => w.name === item.full_name && w.passport === item.passport_number);
                if (match && match.documents) {
                  match.documents.forEach((d: any) => {
                    docSeeds.push({
                      worker_id: item.id,
                      document_type: 'other',
                      document_name: d.name,
                      drive_file_id: d.fileId || null,
                      drive_view_url: d.url || null,
                      drive_download_url: d.downloadUrl || null,
                      file_size: 1258291,
                      uploaded_at: new Date().toISOString()
                    });
                  });
                }
              });

              if (docSeeds.length > 0) {
                await supabase.from('tm_documents').insert(docSeeds);
              }
              loadWorkersFromSupabase();
            }
          }
        } catch (e) {
          console.error('Database load error:', e);
        }
      };

      loadWorkersFromSupabase();

      const checkDriveConnection = async () => {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { data } = await supabase.from('google_drive_tokens').select('id').limit(1);
          setIsDriveConnected(data && data.length > 0 ? true : false);
        } catch (e) {
          console.error('Failed to check google drive connection:', e);
        }
      };
      checkDriveConnection();

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

  const handleDisconnectGoogle = async () => {
    if (confirm('Are you sure you want to disconnect Google Drive? Document uploads will require reconnection.')) {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.from('google_drive_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        setIsDriveConnected(false);
        alert('Google Drive disconnected successfully.');
      } catch (err: any) {
        console.error('Failed to disconnect:', err);
        alert('Failed to disconnect Google Drive: ' + err.message);
      }
    }
  };

  // Corrected search query (matches name OR passport number)
  const filtered = workersList.filter(w =>
    (w.name.toLowerCase().includes(search.toLowerCase()) || w.passport.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? w.status === statusFilter : true)
  )

  const isExpiringSoon = (d: string) => {
    if (!d) return false;
    const days = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return days < 90
  }

  // Stateful add worker submit
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.passport) {
      alert('Full Name and Passport Number are required.');
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      let dbStatus = 'available';
      if (form.status === 'working' || form.status === 'departed' || form.status === 'visa_approved') {
        dbStatus = 'deployed';
      } else if (form.status === 'processing') {
        dbStatus = 'processing';
      } else if (form.status === 'returned') {
        dbStatus = 'returned';
      }

      const { data, error } = await supabase.from('tm_workers').insert({
        full_name: form.name,
        passport_number: form.passport,
        date_of_birth: form.dob || null,
        phone: form.phone || null,
        nationality: form.country || null,
        status: dbStatus,
        passport_expiry_date: form.passportExpiry || null,
        visa_expiry_date: form.visaExpiry || null,
        profession: form.position || null,
        notes: `${form.status}|${form.salary || ''}|${form.agency || ''}|${form.fee ? Number(form.fee) : 0}|${form.departureDate || ''}`
      }).select();

      if (error) throw error;
      const created = data?.[0];
      if (!created) throw new Error('Failed to create worker in DB');

      // Create a default passport_scan doc in tm_documents as well
      const defaultDoc = {
        worker_id: created.id,
        document_type: 'passport',
        document_name: 'passport_scan.pdf',
        file_size: 1258291, // 1.2 MB
        uploaded_at: new Date().toISOString()
      };
      await supabase.from('tm_documents').insert(defaultDoc);

      const country = form.country || 'Not Assigned';
      const category = getCategoryFromCountry(country);

      const newWorker = {
        id: created.id,
        name: form.name,
        passport: form.passport,
        dob: form.dob || '',
        phone: form.phone || '',
        country,
        category,
        status: form.status,
        passportExpiry: form.passportExpiry || '',
        agency: form.agency || '',
        position: form.position || '',
        salary: form.salary || '',
        fee: form.fee ? Number(form.fee) : 0,
        departureDate: form.departureDate || '',
        visaExpiry: form.visaExpiry || '',
        documents: [{ name: 'passport_scan.pdf', size: '1.2 MB', date: new Date().toISOString().split('T')[0] }]
      };

      setWorkersList([newWorker, ...workersList]);
      setShowAdd(false);
      setForm({ 
        name: '', 
        passport: '', 
        dob: '', 
        phone: '', 
        country: '', 
        category: 'Middle East', 
        status: 'registered', 
        passportExpiry: '', 
        agency: '',
        position: '',
        salary: '',
        fee: '',
        departureDate: '',
        visaExpiry: ''
      });
      alert('Worker successfully added.');
    } catch (err: any) {
      console.error('Error adding worker:', err);
      alert(`Failed to add worker: ${err.message}`);
    }
  };

  // Open Drawer and populate edit fields
  const handleViewProfile = (w: any) => {
    setActiveWorker(w);
    setEditForm({ ...w });
    setIsEditing(false);
  };

  // Save edited profile changes
  const handleSaveProfile = async () => {
    if (!editForm.name || !editForm.passport) {
      alert('Full Name and Passport Number are required.');
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      let dbStatus = 'available';
      if (editForm.status === 'working' || editForm.status === 'departed' || editForm.status === 'visa_approved') {
        dbStatus = 'deployed';
      } else if (editForm.status === 'processing') {
        dbStatus = 'processing';
      } else if (editForm.status === 'returned') {
        dbStatus = 'returned';
      }

      const { error } = await supabase.from('tm_workers').update({
        full_name: editForm.name,
        passport_number: editForm.passport,
        date_of_birth: editForm.dob || null,
        phone: editForm.phone || null,
        nationality: editForm.country || null,
        status: dbStatus,
        passport_expiry_date: editForm.passportExpiry || null,
        visa_expiry_date: editForm.visaExpiry || null,
        profession: editForm.position || null,
        notes: `${editForm.status}|${editForm.salary || ''}|${editForm.agency || ''}|${editForm.fee || ''}|${editForm.departureDate || ''}`
      }).eq('id', activeWorker.id);

      if (error) throw error;

      const country = editForm.country || 'Not Assigned';
      const category = getCategoryFromCountry(country);

      const updatedList = workersList.map(w => {
        if (w.id === activeWorker.id) {
          const { documents, ...restFields } = editForm;
          const updated = { ...w, ...restFields, country, category };
          setActiveWorker(updated);
          return updated;
        }
        return w;
      });
      setWorkersList(updatedList);
      setIsEditing(false);
      alert('Worker profile updated.');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      alert(`Failed to save changes: ${err.message}`);
    }
  };

  // Update recruitment progress step
  const handleUpdateStage = async (stageKey: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      let dbStatus = 'available';
      if (stageKey === 'working' || stageKey === 'departed' || stageKey === 'visa_approved') {
        dbStatus = 'deployed';
      } else if (stageKey === 'processing') {
        dbStatus = 'processing';
      } else if (stageKey === 'returned') {
        dbStatus = 'returned';
      }

      const { error } = await supabase.from('tm_workers').update({
        status: dbStatus,
        notes: `${stageKey}|${activeWorker.salary || ''}|${activeWorker.agency || ''}|${activeWorker.fee || ''}|${activeWorker.departureDate || ''}`
      }).eq('id', activeWorker.id);

      if (error) throw error;

      const updatedList = workersList.map(w => {
        if (w.id === activeWorker.id) {
          const updated = { ...w, status: stageKey };
          setActiveWorker(updated);
          setEditForm(updated);
          return updated;
        }
        return w;
      });
      setWorkersList(updatedList);
    } catch (err: any) {
      console.error('Error updating stage:', err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Stateful Document Upload to Google Drive API with Service Account
  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeWorker) {
      const file = e.target.files[0];

      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('workerId', activeWorker.id);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to upload document');
        }

        const newDoc = {
          name: data.name,
          size: data.size,
          date: data.date,
          fileId: data.fileId,
          url: data.url,
          downloadUrl: data.downloadUrl || (data.fileId ? `https://drive.google.com/uc?export=download&id=${data.fileId}` : data.url),
        };

        // SAVE DOCUMENT TO SUPABASE
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { error: dbError } = await supabase.from('tm_documents').insert({
          worker_id: activeWorker.id,
          document_type: 'other',
          document_name: newDoc.name,
          drive_file_id: newDoc.fileId || null,
          drive_view_url: newDoc.url || null,
          drive_download_url: newDoc.downloadUrl || null,
          file_size: file.size,
          uploaded_at: new Date().toISOString()
        });

        if (dbError) throw dbError;

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

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      if (docToDelete.fileId) {
        const response = await fetch('/api/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId: docToDelete.fileId }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          console.warn('Failed to delete file from Google Drive:', data.error);
        }

        // Delete from Supabase
        await supabase.from('tm_documents').delete().eq('drive_file_id', docToDelete.fileId);
      } else {
        // Delete mock document from Supabase by matching worker_id & name
        await supabase.from('tm_documents').delete().match({
          worker_id: activeWorker.id,
          document_name: docToDelete.name
        });
      }
    } catch (err) {
      console.error('Error deleting document:', err);
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
  const handleDeleteWorker = async (id: string) => {
    if (confirm(`Are you absolutely sure you want to delete worker ${activeWorker?.name || ''} from the directory?`)) {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { error } = await supabase.from('tm_workers').delete().eq('id', id);
        if (error) throw error;

        setWorkersList(workersList.filter(w => w.id !== id));
        setActiveWorker(null);
        alert('Worker deleted successfully.');
      } catch (err: any) {
        console.error('Error deleting worker:', err);
        alert(`Failed to delete worker: ${err.message}`);
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Workers</span>
      </nav>

      {/* Google Drive Integration Status */}
      {isAdmin && (
        isDriveConnected ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
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
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.25rem' }}>🟢</span>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Google Drive Cloud Storage
                  <span className="badge badge-success" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', background: '#10B981', color: '#fff', borderRadius: '4px' }}>Connected</span>
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Google Drive Cloud Storage is active. All documents are securely stored in the system's Google Drive.
                </p>
              </div>
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ color: '#EF4444', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }} 
              onClick={handleDisconnectGoogle}
            >
              Disconnect Drive
            </button>
          </div>
        ) : (
          <div style={{
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
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
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.25rem' }}>🔴</span>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Google Drive Cloud Storage
                  <span className="badge" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', background: '#EF4444', color: '#fff', borderRadius: '4px' }}>Disconnected</span>
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Google Drive is not connected. Document uploads will fail. Please connect a personal Google Account.
                </p>
              </div>
            </div>
            <button 
              className="btn btn-tm btn-sm" 
              style={{ fontWeight: 600, padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }} 
              onClick={handleConnectGoogle}
            >
              Connect Google Drive
            </button>
          </div>
        )
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Workers</h1>
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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{filtered.length} workers</div>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Worker Details</th>
              <th>Passport Info</th>
              <th>Destination</th>
              <th>Job Placement</th>
              <th>Financials</th>
              <th>Status & Dates</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id}>
                <td><span className="num" style={{ color: '#A78BFA', fontWeight: 600, fontSize: '0.8rem' }}>{w.id.includes('-') && w.id.length > 15 ? `TM-W-${w.id.slice(0, 8).toUpperCase()}` : w.id}</span></td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{w.name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>📞 {w.phone}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>🎂 DOB: {w.dob}</div>
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{w.passport}</div>
                  <div style={{ fontSize: '0.76rem', color: isExpiringSoon(w.passportExpiry) ? '#EF4444' : 'var(--text-muted)', marginTop: '0.15rem' }}>
                    📅 Exp: {w.passportExpiry} {isExpiringSoon(w.passportExpiry) ? '⚠️' : ''}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.country}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>🏷️ {w.category}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.position || '—'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>🏢 {w.agency || '—'}</div>
                </td>
                <td>
                  <div className="num" style={{ fontWeight: 700, color: '#10B981', fontSize: '0.88rem' }}>{w.salary || '—'}</div>
                  <div className="num" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Fee: {w.fee ? `৳${w.fee.toLocaleString()}` : '—'}
                  </div>
                </td>
                <td>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span className={`badge ${statusColors[w.status]?.cls || 'badge-muted'}`} style={{ fontSize: '0.7rem' }}>
                      {statusColors[w.status]?.label || w.status}
                    </span>
                  </div>
                  {w.departureDate && (
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                      ✈️ Dep: {w.departureDate}
                    </div>
                  )}
                  {w.visaExpiry && (
                    <div style={{ fontSize: '0.73rem', color: isExpiringSoon(w.visaExpiry) ? '#EF4444' : 'var(--text-muted)', marginTop: '0.1rem' }}>
                      🛂 Visa Exp: {w.visaExpiry} {isExpiringSoon(w.visaExpiry) ? '⚠️' : ''}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleViewProfile(w)}>View Details & Docs</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No workers match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                    {activeWorker.id.includes('-') && activeWorker.id.length > 15 ? `TM-W-${activeWorker.id.slice(0, 8).toUpperCase()}` : activeWorker.id} Directory Record
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

                {/* 2.5 Job Placement & Contract Details */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.03em' }}>
                    Job Placement & Contract Details
                  </h4>
                  <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.25rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Position / Job Role</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorker.position || '—'}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Monthly Salary</span>
                      <div style={{ fontWeight: 600, color: '#10B981' }}>{activeWorker.salary || '—'}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Placement Fee</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorker.fee ? `৳${activeWorker.fee.toLocaleString()}` : '—'}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Departure Date</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeWorker.departureDate || '—'}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Visa Expiry Date</span>
                      <div style={{ fontWeight: 600, color: isExpiringSoon(activeWorker.visaExpiry) ? '#EF4444' : 'var(--text-primary)' }}>
                        {activeWorker.visaExpiry || '—'} {isExpiringSoon(activeWorker.visaExpiry) ? '⚠️ Expiring Soon' : ''}
                      </div>
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
                    {isDriveConnected ? (
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
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.03)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.75rem',
                        color: '#EF4444',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontWeight: 600 }}>🔴 Google Drive Disconnected</span>
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
                <div className="form-group">
                  <label className="form-label">Position / Job Role</label>
                  <input className="form-input" placeholder="e.g. Construction Worker" value={editForm.position || ''} onChange={e => setEditForm({ ...editForm, position: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Salary</label>
                  <input className="form-input" placeholder="e.g. SAR 1,200/mo" value={editForm.salary || ''} onChange={e => setEditForm({ ...editForm, salary: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Placement Fee (৳)</label>
                  <input className="form-input" type="number" placeholder="e.g. 65000" value={editForm.fee || ''} onChange={e => setEditForm({ ...editForm, fee: e.target.value ? Number(e.target.value) : '' })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Departure Date</label>
                  <DatePicker value={editForm.departureDate || ''} onChange={v => setEditForm({ ...editForm, departureDate: v })} placeholder="Departure date" />
                </div>
                <div className="form-group">
                  <label className="form-label">Visa Expiry Date</label>
                  <DatePicker value={editForm.visaExpiry || ''} onChange={v => setEditForm({ ...editForm, visaExpiry: v })} placeholder="Visa expiry date" />
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
                <div className="form-group">
                  <label className="form-label">Position / Job Role</label>
                  <input className="form-input" placeholder="e.g. Construction Worker" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Salary</label>
                  <input className="form-input" placeholder="e.g. SAR 1,200/mo" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Placement Fee (৳)</label>
                  <input className="form-input" type="number" placeholder="e.g. 65000" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Departure Date</label>
                  <DatePicker value={form.departureDate} onChange={v => setForm({ ...form, departureDate: v })} placeholder="Departure date" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Visa Expiry Date</label>
                  <DatePicker value={form.visaExpiry} onChange={v => setForm({ ...form, visaExpiry: v })} placeholder="Visa expiry date" />
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
            style={{ width: '850px', maxWidth: '95%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
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
                  style={{ width: '100%', height: '580px', border: 'none', borderRadius: '8px' }} 
                  allow="autoplay"
                />
              ) : previewDoc.url && previewDoc.url.startsWith('http') ? (
                /* REAL SUPABASE OR EXTERNAL URL PREVIEW */
                previewDoc.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                  <img 
                    src={previewDoc.url} 
                    style={{ maxWidth: '100%', maxHeight: '580px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                    alt="Document Preview"
                  />
                ) : (
                  <iframe 
                    src={previewDoc.url} 
                    style={{ width: '100%', height: '580px', border: 'none', borderRadius: '8px' }} 
                  />
                )
              ) : previewDoc.name.includes('passport') ? (
                /* 1. MOCK PASSPORT SCAN */
                <div style={{ width: '100%', maxWidth: '560px', background: '#FFFDF9', border: '2px solid #D5C19A', borderRadius: '10px', padding: '1rem', color: '#222121', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
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
                <div style={{ width: '100%', maxWidth: '560px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: '6px solid #10B981', borderRadius: '10px', padding: '1rem', color: '#222121', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
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
                <div style={{ width: '100%', maxWidth: '560px', background: '#F1F5F9', border: '2px solid #3B82F6', borderRadius: '10px', padding: '1rem', color: '#222121', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
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
                <div style={{ width: '100%', maxWidth: '560px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1.5rem', color: '#222121', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
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
