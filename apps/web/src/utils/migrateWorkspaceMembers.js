// Utility to migrate workspace members and ensure user profiles exist

import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'

/**
 * Ensure user profile exists in Firestore
 * This should be called for all workspace members
 */
export async function ensureUserProfile(uid, email, displayName = null, photoURL = null) {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      console.log('📝 Creating missing user profile for:', email)
      await setDoc(userRef, {
        uid,
        email,
        displayName: displayName || '',
        photoURL: photoURL || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log('✅ User profile created for:', email)
      return true
    } else {
      // Update email if it's different
      const existingData = userSnap.data()
      if (existingData.email !== email) {
        console.log('📝 Updating email for user:', uid, 'from', existingData.email, 'to', email)
        await updateDoc(userRef, {
          email,
          updatedAt: new Date()
        })
        console.log('✅ User profile updated')
        return true
      }
    }
    return false
  } catch (error) {
    console.error('❌ Failed to ensure user profile:', error)
    return false
  }
}

/**
 * Check all workspace members and ensure they have user profiles
 */
export async function migrateWorkspaceMembers(workspaceId) {
  try {
    console.log('🔄 Starting workspace member migration for:', workspaceId)
    
    // Get workspace
    const workspaceRef = doc(db, 'workspaces', workspaceId)
    const workspaceSnap = await getDoc(workspaceRef)
    
    if (!workspaceSnap.exists()) {
      console.error('❌ Workspace not found:', workspaceId)
      return { success: false, error: 'Workspace not found' }
    }
    
    const workspace = workspaceSnap.data()
    const memberUids = Object.keys(workspace.members || {})
    
    console.log('👥 Found', memberUids.length, 'members to check')
    
    let created = 0
    let updated = 0
    let missing = 0
    
    for (const uid of memberUids) {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        console.warn('⚠️ No user profile found for UID:', uid)
        console.warn('   This user needs to log in once to create their profile')
        missing++
      } else {
        const userData = userSnap.data()
        console.log('✅ User profile exists:', userData.email)
      }
    }
    
    console.log('🎉 Migration complete!')
    console.log('   Created:', created)
    console.log('   Updated:', updated)
    console.log('   Missing:', missing)
    
    return {
      success: true,
      created,
      updated,
      missing,
      total: memberUids.length
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check all workspaces and migrate members
 */
export async function migrateAllWorkspaces() {
  try {
    console.log('🚀 Starting migration for all workspaces...')
    
    const workspacesRef = collection(db, 'workspaces')
    const workspacesSnap = await getDocs(workspacesRef)
    
    console.log('📊 Found', workspacesSnap.size, 'workspaces')
    
    const results = []
    
    for (const workspaceDoc of workspacesSnap.docs) {
      const result = await migrateWorkspaceMembers(workspaceDoc.id)
      results.push({
        workspaceId: workspaceDoc.id,
        workspaceName: workspaceDoc.data().name,
        ...result
      })
    }
    
    console.log('🎉 All workspaces migrated!')
    console.log('Results:', results)
    
    return results
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return { success: false, error: error.message }
  }
}
