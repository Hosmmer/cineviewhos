import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/admin/movies', { replace: true })
  }, [navigate])

  return null
}

export default AdminDashboard
