import { useAuth } from '../context/AuthContext'
import UserDashboard from '../components/dashboard/UserDashboard'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Dashboard = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please log in to access your dashboard.
          </p>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  if (user.role === 'ADMIN') {
    return <AdminDashboard />
  }

  return <UserDashboard />
}

export default Dashboard