/**
 * Debug utility for Google Login issues
 * 
 * This helps diagnose why the screen goes blank after Google login
 */

export function debugGoogleLogin() {
  console.log('🔍 GOOGLE LOGIN DEBUG')
  console.log('='.repeat(60))
  
  // Check auth state
  const authStore = window.useAuthStore?.getState()
  console.log('1️⃣ Auth State:')
  console.log('   User:', authStore?.user ? {
    uid: authStore.user.uid,
    email: authStore.user.email,
    displayName: authStore.user.displayName
  } : 'null')
  console.log('   Loading:', authStore?.loading)
  
  // Check workspace state
  const workspaceStore = window.useWorkspaceStore?.getState()
  console.log('\n2️⃣ Workspace State:')
  console.log('   Workspaces:', workspaceStore?.workspaces?.length || 0)
  console.log('   Current Workspace:', workspaceStore?.currentWorkspace?.name || 'null')
  console.log('   Loading:', workspaceStore?.loading)
  
  // Check if user profile exists
  if (authStore?.user?.uid) {
    import('firebase/firestore').then(({ doc, getDoc }) => {
      import('../services/firebase').then(({ db }) => {
        getDoc(doc(db, 'users', authStore.user.uid)).then(userDoc => {
          console.log('\n3️⃣ User Profile in Firestore:')
          if (userDoc.exists()) {
            console.log('   ✅ Profile exists:', userDoc.data())
          } else {
            console.log('   ❌ Profile does NOT exist!')
            console.log('   This might cause issues!')
          }
        })
      })
    })
  }
  
  // Check for errors
  console.log('\n4️⃣ Check for errors in console above')
  console.log('='.repeat(60))
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.debugGoogleLogin = debugGoogleLogin
}
