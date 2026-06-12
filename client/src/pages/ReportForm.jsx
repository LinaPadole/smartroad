import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function ReportForm() {
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium' })
  const [photo, setPhoto] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => alert('Could not get location. Please allow location access.')
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!location) return alert('Please get your location first!')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const data = new FormData()
      data.append('title', form.title)
      data.append('description', form.description)
      data.append('severity', form.severity)
      data.append('latitude', location.lat)
      data.append('longitude', location.lng)
      if (photo) data.append('photo', photo)

      await axios.post('http://localhost:5000/api/reports', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      setSuccess(true)
      setTimeout(() => navigate('/reports'), 2000)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
    setLoading(false)
  }

  if (success) return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',flexDirection:'column'}}>
      <div style={{fontSize:'64px'}}>✅</div>
      <h2>Report Submitted Successfully!</h2>
      <p>Redirecting to reports...</p>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button style={styles.back} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={styles.title}>📸 Report a Pothole</h2>
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" placeholder="Title (e.g. Deep pothole near bus stop)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <textarea style={{...styles.input, height:'100px'}} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          <select style={styles.input} value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
            <option value="low">Low — Small crack</option>
            <option value="medium">Medium — Noticeable pothole</option>
            <option value="high">High — Dangerous, large pothole</option>
          </select>
          <div style={styles.locationBox}>
            <button type="button" style={styles.locationBtn} onClick={getLocation}>📍 Get My Location</button>
            {location && <span style={styles.locationText}>✅ Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>}
          </div>
          <input style={styles.input} type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
          {form.severity === 'high' && <p style={styles.budget}>💰 Estimated repair cost: ₹15,000</p>}
          {form.severity === 'medium' && <p style={styles.budget}>💰 Estimated repair cost: ₹8,000</p>}
          {form.severity === 'low' && <p style={styles.budget}>💰 Estimated repair cost: ₹3,000</p>}
          <button style={styles.button} type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '40px 16px', background: '#f0f4f8', minHeight: '100vh' },
  card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' },
  title: { color: '#2d3748', marginBottom: '24px' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  back: { background: 'none', border: 'none', color: '#4299e1', cursor: 'pointer', fontSize: '16px', marginBottom: '16px', padding: 0 },
  locationBox: { marginBottom: '16px' },
  locationBtn: { padding: '10px 20px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  locationText: { marginLeft: '12px', color: '#48bb78', fontSize: '14px' },
  budget: { background: '#ebf8ff', padding: '12px', borderRadius: '8px', color: '#2b6cb0', marginBottom: '16px' }
}