import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Analytics() {
  const [reports, setReports] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('https://smartroad-backend-4xzz.onrender.com/api/reports').then(res => setReports(res.data))
  }, [])

  const total = reports.length
  const fixed = reports.filter(r => r.status === 'fixed').length
  const inProgress = reports.filter(r => r.status === 'in_progress').length
  const reported = reports.filter(r => r.status === 'reported').length
  const totalBudget = reports.reduce((sum, r) => sum + r.budgetEstimate, 0)
  const highSeverity = reports.filter(r => r.severity === 'high').length
  const mediumSeverity = reports.filter(r => r.severity === 'medium').length
  const lowSeverity = reports.filter(r => r.severity === 'low').length

  const StatCard = ({ icon, label, value, color }) => (
    <div style={{background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', textAlign:'center', minWidth:'150px'}}>
      <div style={{fontSize:'36px'}}>{icon}</div>
      <div style={{fontSize:'32px', fontWeight:'bold', color}}>{value}</div>
      <div style={{color:'#718096', fontSize:'14px'}}>{label}</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#f0f4f8', fontFamily:'sans-serif', padding:'24px'}}>
      <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'32px'}}>
        <button style={{background:'none', border:'none', color:'#4299e1', cursor:'pointer', fontSize:'16px'}} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={{margin:0, color:'#2d3748'}}>📊 Analytics Dashboard</h2>
      </div>

      <h3 style={{color:'#4a5568', marginBottom:'16px'}}>Overview</h3>
      <div style={{display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'32px'}}>
        <StatCard icon="📋" label="Total Reports" value={total} color="#2d3748" />
        <StatCard icon="✅" label="Fixed" value={fixed} color="#48bb78" />
        <StatCard icon="🔧" label="In Progress" value={inProgress} color="#4299e1" />
        <StatCard icon="🚨" label="Pending" value={reported} color="#fc8181" />
        <StatCard icon="💰" label={`Total Budget`} value={`₹${totalBudget.toLocaleString()}`} color="#ed8936" />
      </div>

      <h3 style={{color:'#4a5568', marginBottom:'16px'}}>Severity Breakdown</h3>
      <div style={{display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'32px'}}>
        <StatCard icon="🔴" label="High Severity" value={highSeverity} color="#fc8181" />
        <StatCard icon="🟡" label="Medium Severity" value={mediumSeverity} color="#f6ad55" />
        <StatCard icon="🟢" label="Low Severity" value={lowSeverity} color="#48bb78" />
      </div>

      <h3 style={{color:'#4a5568', marginBottom:'16px'}}>Resolution Rate</h3>
      <div style={{background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', marginBottom:'32px'}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
          <span style={{color:'#4a5568'}}>Fixed vs Total</span>
          <span style={{fontWeight:'bold', color:'#48bb78'}}>{total ? Math.round((fixed/total)*100) : 0}%</span>
        </div>
        <div style={{background:'#e2e8f0', borderRadius:'99px', height:'16px'}}>
          <div style={{background:'#48bb78', borderRadius:'99px', height:'16px', width:`${total ? (fixed/total)*100 : 0}%`, transition:'width 0.5s'}}></div>
        </div>
      </div>

      <h3 style={{color:'#4a5568', marginBottom:'16px'}}>All Reports</h3>
      <div style={{background:'white', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f7fafc'}}>
              <th style={{padding:'12px 16px', textAlign:'left', color:'#4a5568', fontSize:'13px'}}>Title</th>
              <th style={{padding:'12px 16px', textAlign:'left', color:'#4a5568', fontSize:'13px'}}>Severity</th>
              <th style={{padding:'12px 16px', textAlign:'left', color:'#4a5568', fontSize:'13px'}}>Status</th>
              <th style={{padding:'12px 16px', textAlign:'left', color:'#4a5568', fontSize:'13px'}}>Budget</th>
              <th style={{padding:'12px 16px', textAlign:'left', color:'#4a5568', fontSize:'13px'}}>Upvotes</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} style={{borderTop:'1px solid #e2e8f0'}}>
                <td style={{padding:'12px 16px', fontSize:'14px'}}>{r.title}</td>
                <td style={{padding:'12px 16px', fontSize:'14px', textTransform:'capitalize'}}>{r.severity}</td>
                <td style={{padding:'12px 16px', fontSize:'14px', textTransform:'capitalize'}}>{r.status.replace('_',' ')}</td>
                <td style={{padding:'12px 16px', fontSize:'14px'}}>₹{r.budgetEstimate.toLocaleString()}</td>
                <td style={{padding:'12px 16px', fontSize:'14px'}}>{r.upvotes?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}