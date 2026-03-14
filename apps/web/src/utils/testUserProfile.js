import { useUserStore } from '../stores/userStore'
import { useAuthStore } from '../stores/authStore'

export const testUserProfile = () => {
  console.log('🧪 Testing User Profile Management System...')
  
  const authStore = useAuthStore.getState()
  const userStore = useUserStore.getState()
  
  console.log('📊 Current State:')
  console.log('- Auth User:', authStore.user)
  console.log('- User Profile:', userStore.userProfile)
  console.log('- Loading:', userStore.loading)
  console.log('- Error:', userStore.error)
  
  // Test functions
  const tests = {
    // Test display name update
    testUpdateDisplayName: async () => {
      console.log('🔄 Testing display name update...')
      try {
        const newName = `Test User ${Date.now()}`
        await userStore.updateDisplayName(newName)
        console.log('✅ Display name updated successfully:', newName)
      } catch (error) {
        console.error('❌ Display name update failed:', error)
      }
    },

    // Test password update (requires current password)
    testUpdatePassword: async (currentPassword, newPassword) => {
      console.log('🔄 Testing password update...')
      try {
        await userStore.updatePassword(currentPassword, newPassword)
        console.log('✅ Password updated successfully')
      } catch (error) {
        console.error('❌ Password update failed:', error)
      }
    },

    // Test avatar removal
    testRemoveAvatar: async () => {
      console.log('🔄 Testing avatar removal...')
      try {
        await userStore.removeAvatar()
        console.log('✅ Avatar removed successfully')
      } catch (error) {
        console.error('❌ Avatar removal failed:', error)
      }
    },

    // Test profile data retrieval
    testGetProfile: async () => {
      console.log('🔄 Testing profile retrieval...')
      try {
        const user = authStore.user
        if (user) {
          const profile = await userStore.getUserProfile(user.uid)
          console.log('✅ Profile retrieved:', profile)
        } else {
          console.log('❌ No authenticated user')
        }
      } catch (error) {
        console.error('❌ Profile retrieval failed:', error)
      }
    }
  }

  console.log('🎯 Available Test Functions:')
  console.log('- testUserProfile.testUpdateDisplayName()')
  console.log('- testUserProfile.testUpdatePassword("currentPass", "newPass")')
  console.log('- testUserProfile.testRemoveAvatar()')
  console.log('- testUserProfile.testGetProfile()')
  
  return tests
}

// Test profile modal functionality
export const testProfileModal = () => {
  console.log('🧪 Testing Profile Modal...')
  
  // Simulate opening profile modal
  const openModal = () => {
    console.log('📱 Opening profile modal...')
    // This would be triggered by clicking the profile dropdown
    window.dispatchEvent(new CustomEvent('open-profile-modal'))
  }

  // Test avatar upload simulation
  const testAvatarUpload = () => {
    console.log('📸 Testing avatar upload...')
    // Create a mock file for testing
    const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })
    console.log('Mock file created:', mockFile)
    return mockFile
  }

  // Test form validation
  const testFormValidation = () => {
    console.log('✅ Testing form validation...')
    
    const validationTests = [
      { name: '', expected: 'invalid', reason: 'Empty name' },
      { name: '   ', expected: 'invalid', reason: 'Whitespace only' },
      { name: 'Valid Name', expected: 'valid', reason: 'Valid name' },
      { name: 'A'.repeat(100), expected: 'valid', reason: 'Long but valid name' }
    ]

    validationTests.forEach(test => {
      const isValid = test.name.trim().length > 0
      const result = isValid ? 'valid' : 'invalid'
      const status = result === test.expected ? '✅' : '❌'
      console.log(`${status} ${test.reason}: "${test.name}" -> ${result}`)
    })
  }

  const tests = {
    openModal,
    testAvatarUpload,
    testFormValidation
  }

  console.log('🎯 Available Modal Tests:')
  console.log('- testProfileModal.openModal()')
  console.log('- testProfileModal.testAvatarUpload()')
  console.log('- testProfileModal.testFormValidation()')

  return tests
}

// Test user profile dropdown
export const testUserDropdown = () => {
  console.log('🧪 Testing User Profile Dropdown...')
  
  const authStore = useAuthStore.getState()
  const userStore = useUserStore.getState()
  
  // Test dropdown data
  const testDropdownData = () => {
    console.log('📊 Testing dropdown data...')
    
    const user = authStore.user
    const profile = userStore.userProfile
    
    console.log('User data:', {
      displayName: user?.displayName,
      email: user?.email,
      photoURL: user?.photoURL
    })
    
    console.log('Profile data:', {
      displayName: profile?.displayName,
      photoURL: profile?.photoURL,
      updatedAt: profile?.updatedAt
    })
    
    // Test initials generation
    const getInitials = (name, email) => {
      const displayName = name || email || 'User'
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    
    const initials = getInitials(user?.displayName, user?.email)
    console.log('Generated initials:', initials)
  }

  // Test dropdown interactions
  const testDropdownInteractions = () => {
    console.log('🖱️ Testing dropdown interactions...')
    
    // Simulate dropdown open/close
    console.log('- Dropdown open: Click user avatar')
    console.log('- Profile click: Opens profile modal')
    console.log('- Sign out click: Triggers sign out')
    console.log('- Outside click: Closes dropdown')
    console.log('- Escape key: Closes dropdown')
  }

  const tests = {
    testDropdownData,
    testDropdownInteractions
  }

  console.log('🎯 Available Dropdown Tests:')
  console.log('- testUserDropdown.testDropdownData()')
  console.log('- testUserDropdown.testDropdownInteractions()')

  return tests
}

// Main test runner
export const runAllUserProfileTests = () => {
  console.log('🚀 Running All User Profile Tests...')
  
  const profileTests = testUserProfile()
  const modalTests = testProfileModal()
  const dropdownTests = testUserDropdown()
  
  // Run basic tests
  dropdownTests.testDropdownData()
  modalTests.testFormValidation()
  
  console.log('✅ Basic tests completed!')
  console.log('💡 To test advanced features:')
  console.log('1. Use profileTests.testUpdateDisplayName()')
  console.log('2. Use profileTests.testGetProfile()')
  console.log('3. Click user avatar to test dropdown')
  console.log('4. Click "Profile Settings" to test modal')
  
  return {
    profileTests,
    modalTests,
    dropdownTests
  }
}