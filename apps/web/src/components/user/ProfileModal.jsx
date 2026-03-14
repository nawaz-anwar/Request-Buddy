import { useState, useEffect } from 'react'
import { X, User, Mail, Shield, Save, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useUserStore } from '../../stores/userStore'
import AvatarUploader from './AvatarUploader'
import ChangePasswordForm from './ChangePasswordForm'

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuthStore()
  const { 
    userProfile, 
    loading, 
    error, 
    updateDisplayName, 
    updateAvatar, 
    removeAvatar, 
    updatePassword,
    clearError 
  } = useUserStore()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [displayName, setDisplayName] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize display name when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName || '')
      setHasChanges(false)
      clearError()
    }
  }, [isOpen, user, clearError])

  // Track changes
  useEffect(() => {
    if (user) {
      setHasChanges(displayName !== (user.displayName || ''))
    }
  }, [displayName, user])

  const handleSaveProfile = async () => {
    if (!hasChanges) return

    try {
      await updateDisplayName(displayName.trim())
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleAvatarUpload = async (file) => {
    try {
      await updateAvatar(file)
    } catch (error) {
      console.error('Failed to update avatar:', error)
    }
  }

  const handleAvatarRemove = async () => {
    try {
      await removeAvatar()
    } catch (error) {
      console.error('Failed to remove avatar:', error)
    }
  }

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      await updatePassword(currentPassword, newPassword)
      // Switch back to profile tab after successful password change
      setActiveTab('profile')
    } catch (error) {
      console.error('Failed to update password:', error)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile Settings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Avatar Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Profile Photo
                </h3>
                <AvatarUploader
                  currentPhotoURL={user?.photoURL}
                  displayName={displayName}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarRemove}
                  loading={loading}
                />
              </div>

              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your display name"
                      disabled={loading}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      This name will be visible to other users in workspaces
                    </p>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Email cannot be changed for security reasons
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {hasChanges && (
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading || !displayName.trim()}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Change Password
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Update your password to keep your account secure
                </p>
              </div>

              <ChangePasswordForm
                onSubmit={handlePasswordChange}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}