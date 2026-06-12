import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reports')
      setReports(res.data)
    } catch (err) {
      alert('Failed to fetch reports')
    }
    setLoading(false)
  }

  const handleUpvote = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/reports/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchReports()
    } catch (err) {
      alert('Already upvoted or not logged in')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/reports/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchReports()
    } catch (err) {
      alert('Failed to update status')
    }
  }

   const handleAfterPhoto = async (id, file) => {
    try {
      const data = new FormData()
      data.append('photo', file)
      await axios.post(`http://localhost:5000/api/reports/${id}/after-photo`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      fetchReports()
    } catch (err) {
      alert('Failed to upload after photo')
    }
  }
  
  const statusColor = (status) => {
    if (status === 'reported') return '#fc8181'
    if (status === 'assigned') return '#f6ad55'
    if (status === 'in_progress') return '#4299e1'
    if (status === 'fixed') return '#48bb78'
    return '#a0aec0'
  }

  const severityColor = (severity) => {
    if (severity === 'high') return '#fc8181'
    if (severity === 'medium') return '#f6ad55'
    return '#48bb78'
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}><h2>Loading reports...</h2></div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={styles.title}>🗺️ All Pothole Reports</h2>
        {user?.role === 'citizen' && (
          <button style={styles.reportBtn} onClick={() => navigate('/report')}>+ Report New</button>
        )}
      </div>

      {reports.length === 0 && <p style={{textAlign:'center',color:'#718096',marginTop:'40px'}}>No reports yet. Be the first to report!</p>}

      <div style={styles.grid}>
        {reports.map(report => (
          <div key={report.id} style={styles.card}>
            {report.photoUrl && (
              <img src={`http://localhost:5000${report.photoUrl}`} alt="pothole" style={styles.photo} />
            )}
            <div style={styles.cardBody}>
              <div style={styles.badges}>
                <span style={{...styles.badge, background: severityColor(report.severity)}}>{report.severity.toUpperCase()}</span>
                <span style={{...styles.badge, background: statusColor(report.status)}}>{report.status.replace('_',' ').toUpperCase()}</span>
              </div>
              <h3 style={styles.reportTitle}>{report.title}</h3>
              <p style={styles.desc}>{report.description}</p>
              <p style={styles.meta}>👤 {report.user?.name} • 📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>
              <p style={styles.budget}>💰 Estimated: ₹{report.budgetEstimate.toLocaleString()}</p>

              <div style={styles.statusTracker}>
                {['reported','assigned','in_progress','fixed'].map((s, i) => (
                  <div key={s} style={styles.trackerStep}>
                    <div style={{...styles.trackerDot, background: ['reported','assigned','in_progress','fixed'].indexOf(report.status) >= i ? '#4299e1' : '#e2e8f0'}}></div>
                    <span style={styles.trackerLabel}>{s.replace('_',' ')}</span>
                  </div>
                ))}
              </div>

              <div style={styles.actions}>
                <button style={styles.upvoteBtn} onClick={() => handleUpvote(report.id)}>
                  👍 {report.upvotes?.length || 0} Upvotes
                </button>
                {user?.role === 'municipality' && (
                  <select style={styles.select} value={report.status} onChange={e => handleStatusChange(report.id, e.target.value)}>
                    <option value="reported">Reported</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="fixed">Fixed</option>
                  </select>
                )}
                {user?.role === 'contractor' && report.status !== 'fixed' && (
                  <label style={styles.uploadBtn}>
                    📸 Upload After Photo
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={e => handleAfterPhoto(report.id, e.target.files[0])} />
                  </label>
                )}
                {report.afterPhotoUrl && (
                  <div style={{marginTop:'8px',width:'100%'}}>
                    <p style={{fontSize:'12px',color:'#48bb78',fontWeight:'bold'}}>✅ After Photo (Verified)</p>
                    <img src={`http://localhost:5000${report.afterPhotoUrl}`} style={{width:'100%',borderRadius:'8px'}} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', fontFamily: 'sans-serif', padding: '24px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  title: { color: '#2d3748', margin: 0, flex: 1 },
  back: { background: 'none', border: 'none', color: '#4299e1', cursor: 'pointer', fontSize: '16px', padding: 0 },
  reportBtn: { padding: '10px 20px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' },
  photo: { width: '100%', height: '200px', objectFit: 'cover' },
  cardBody: { padding: '20px' },
  badges: { display: 'flex', gap: '8px', marginBottom: '12px' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: 'white' },
  reportTitle: { margin: '0 0 8px', color: '#2d3748' },
  desc: { color: '#718096', fontSize: '14px', marginBottom: '8px' },
  meta: { color: '#a0aec0', fontSize: '12px', marginBottom: '8px' },
  budget: { color: '#2b6cb0', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' },
  statusTracker: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  trackerStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  trackerDot: { width: '12px', height: '12px', borderRadius: '50%' },
  trackerLabel: { fontSize: '9px', color: '#718096', textTransform: 'capitalize' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  upvoteBtn: { padding: '8px 16px', background: '#ebf8ff', color: '#2b6cb0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  select: { padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }
}
