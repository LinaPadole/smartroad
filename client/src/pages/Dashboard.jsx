import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (!user) { navigate('/login'); return null }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛣️ SmartRoad</h1>
        <div style={styles.userInfo}>
          <span style={styles.role}>{user.role.toUpperCase()}</span>
          <span style={styles.name}>👤 {user.name}</span>
          <button style={styles.logout} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.welcome}>
        <h2>Welcome, {user.name}! 👋</h2>
        <p style={styles.subtitle}>What would you like to do today?</p>
      </div>

      <div style={styles.cards}>
        {user.role === 'citizen' && (
          <>
            <div style={styles.card} onClick={() => navigate('/report')}>
              <div style={styles.cardIcon}>📸</div>
              <h3>Report Pothole</h3>
              <p>Upload photo and location of a pothole</p>
            </div>
            <div style={styles.card} onClick={() => navigate('/reports')}>
              <div style={styles.cardIcon}>📋</div>
              <h3>View All Reports</h3>
              <p>See all potholes reported in your area</p>
            </div>
            <div style={styles.card} onClick={() => navigate('/map')}>
              <div style={styles.cardIcon}>🗺️</div>
              <h3>View Map</h3>
              <p>See all potholes on a live map</p>
            </div>
          </>
        )}
        {user.role === 'municipality' && (
          <>
            <div style={styles.card} onClick={() => navigate('/reports')}>
              <div style={styles.cardIcon}>📋</div>
              <h3>All Reports</h3>
              <p>View and manage all pothole reports</p>
            </div>
            <div style={styles.card} onClick={() => navigate('/map')}>
              <div style={styles.cardIcon}>🗺️</div>
              <h3>View Map</h3>
              <p>See all potholes on a live map</p>
            </div>
            <div style={styles.card} onClick={() => navigate('/analytics')}>
              <div style={styles.cardIcon}>📊</div>
              <h3>Analytics</h3>
              <p>View reports, budget and resolution stats</p>
            </div>
          </>
        )}
        {user.role === 'contractor' && (
          <>
            <div style={styles.card} onClick={() => navigate('/reports')}>
              <div style={styles.cardIcon}>🏗️</div>
              <h3>My Assignments</h3>
              <p>View your assigned repair jobs</p>
            </div>
            <div style={styles.card} onClick={() => navigate('/map')}>
              <div style={styles.cardIcon}>🗺️</div>
              <h3>View Map</h3>
              <p>See all potholes on a live map</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', fontFamily: 'sans-serif' },
  header: { background: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  title: { color: '#2d3748', margin: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  role: { background: '#ebf8ff', color: '#2b6cb0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  name: { color: '#4a5568' },
  logout: { padding: '8px 16px', background: '#fc8181', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  welcome: { padding: '40px 32px 20px', textAlign: 'center' },
  subtitle: { color: '#718096' },
  cards: { display: 'flex', gap: '24px', padding: '20px 32px', flexWrap: 'wrap', justifyContent: 'center' },
  card: { background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', width: '220px', textAlign: 'center', cursor: 'pointer' },
  cardIcon: { fontSize: '48px', marginBottom: '16px' }
}