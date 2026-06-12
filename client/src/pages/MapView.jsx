import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const severityIcon = (severity) => {
  const color = severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'green'
  return L.divIcon({
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [16, 16]
  })
}

export default function MapView() {
  const [reports, setReports] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('https://smartroad-backend-4xzz.onrender.com/api/reports').then(res => setReports(res.data))
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={styles.title}>🗺️ Pothole Map</h2>
        <div style={styles.legend}>
          <span style={styles.dot('red')}></span> High
          <span style={styles.dot('orange')}></span> Medium
          <span style={styles.dot('green')}></span> Low
        </div>
      </div>

      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={styles.map}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {reports.map(report => (
          <Marker key={report.id} position={[report.latitude, report.longitude]} icon={severityIcon(report.severity)}>
            <Popup>
              <div style={{minWidth:'200px'}}>
                <h3 style={{margin:'0 0 8px'}}>{report.title}</h3>
                {report.photoUrl && <img src={`https://smartroad-backend-4xzz.onrender.com${report.photoUrl}`} style={{width:'100%',borderRadius:'4px',marginBottom:'8px'}} />}
                <p style={{margin:'4px 0',fontSize:'13px'}}>📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>
                <p style={{margin:'4px 0',fontSize:'13px'}}>⚠️ Severity: <b>{report.severity}</b></p>
                <p style={{margin:'4px 0',fontSize:'13px'}}>📊 Status: <b>{report.status}</b></p>
                <p style={{margin:'4px 0',fontSize:'13px'}}>💰 Est: ₹{report.budgetEstimate?.toLocaleString()}</p>
                <p style={{margin:'4px 0',fontSize:'13px'}}>👍 {report.upvotes?.length || 0} upvotes</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' },
  header: { background: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 1000 },
  title: { margin: 0, color: '#2d3748', flex: 1 },
  back: { background: 'none', border: 'none', color: '#4299e1', cursor: 'pointer', fontSize: '16px', padding: 0 },
  legend: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4a5568' },
  dot: (color) => ({ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: color, marginLeft: '8px', marginRight: '4px' }),
  map: { flex: 1 }
}