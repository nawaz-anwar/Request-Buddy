// Test utilities for member management system

export async function testUserProfiles() {
  console.log('🧪 Testing User Profile System...')
  
  const { useUserStore } = await import('../stores/userStore')
  const { useAuthStore } = await import('../stores/authStore')
  const { useWorkspaceStore } = await import('../stores/workspaceStore')
  
  const userStore = useUserStore.getState()
  const authStore = useAuthStore.getState()
  const workspaceStore = useWorkspaceStore.getState()
  
  // Test 1: Get current user profile
  const currentUser = authStore.user
  if (!currentUser) {
    console.error('❌ No user logged in')
    return
  }
  
  console.log('👤 Current user:', currentUser.email)
  const profile = await userStore.getUserProfile(currentUser.uid)
  console.log('✅ Current user profile:', profile)
  
  // Test 2: Verify email matches
  if (profile && profile.email === currentUser.email) {
    console.log('✅ Email matches Firebase Auth')
  } else {
    console.error('❌ Email mismatch or profile not found!')
  }
  
  // Test 3: Get multiple profiles
  const workspace = workspaceStore.currentWorkspace
  if (!workspace) {
    console.error('❌ No workspace selected')
    return
  }
  
  const memberUids = Object.keys(workspace.members)
  console.log('👥 Fetching profiles for', memberUids.length, 'members...')
  const profiles = await userStore.getUserProfiles(memberUids)
  console.log('✅ Fetched', profiles.length, 'member profiles:', profiles)
  
  // Test 4: Verify no dummy emails
  const hasDummyEmails = profiles.some(p => p.email && p.email.includes('@example.com'))
  if (!hasDummyEmails) {
    console.log('✅ No dummy emails found')
  } else {
    console.error('❌ Dummy emails still present!')
  }
  
  console.log('🎉 User profile system test complete!')
  return { currentUser, profile, profiles, hasDummyEmails }
}


export async function testMemberManagementModal() {
  console.log('🧪 Testing Member Management Modal...')
  
  const { useWorkspaceStore } = await import('../stores/workspaceStore')
  const { useUserStore } = await import('../stores/userStore')
  
  const workspaceStore = useWorkspaceStore.getState()
  const userStore = useUserStore.getState()
  
  const workspace = workspaceStore.currentWorkspace
  if (!workspace) {
    console.error('❌ No workspace selected')
    return
  }
  
  console.log('🏢 Testing workspace:', workspace.name)
  console.log('👥 Members:', Object.keys(workspace.members).length)
  
  // Fetch all member profiles
  const memberUids = Object.keys(workspace.members)
  const profiles = await userStore.getUserProfiles(memberUids)
  
  // Create member list
  const members = memberUids.map(uid => {
    const profile = profiles.find(p => p.uid === uid)
    return {
      uid,
      role: workspace.members[uid],
      email: profile?.email || 'NOT FOUND',
      isOwner: uid === workspace.ownerId
    }
  })
  
  console.log('📋 Member List:')
  members.forEach(member => {
    const ownerBadge = member.isOwner ? '👑' : ''
    const emailStatus = member.email.includes('@example.com') ? '❌' : '✅'
    console.log(`  ${emailStatus} ${member.email} (${member.role}) ${ownerBadge}`)
  })
  
  const allRealEmails = members.every(m => !m.email.includes('@example.com') && m.email !== 'NOT FOUND')
  if (allRealEmails) {
    console.log('✅ All members have real emails!')
  } else {
    console.error('❌ Some members still have dummy emails or missing profiles')
  }
  
  console.log('🎉 Member management modal test complete!')
  return { workspace, members, allRealEmails }
}

export async function runAllMemberTests() {
  console.log('🚀 Running all member management tests...\n')
  
  const test1 = await testUserProfiles()
  console.log('\n---\n')
  const test2 = await testMemberManagementModal()
  
  console.log('\n📊 Test Summary:')
  console.log('  User Profiles:', test1 ? '✅ PASS' : '❌ FAIL')
  console.log('  Member Management:', test2?.allRealEmails ? '✅ PASS' : '❌ FAIL')
  
  return { test1, test2 }
}


export async function testDuplicateMembers() {
  console.log('🧪 Testing for duplicate members...')
  
  const { useWorkspaceStore } = await import('../stores/workspaceStore')
  const { useUserStore } = await import('../stores/userStore')
  const { useAuthStore } = await import('../stores/authStore')
  
  const workspaceStore = useWorkspaceStore.getState()
  const userStore = useUserStore.getState()
  const authStore = useAuthStore.getState()
  
  const workspace = workspaceStore.currentWorkspace
  const currentUser = authStore.user
  
  if (!workspace) {
    console.error('❌ No workspace selected')
    return
  }
  
  console.log('🏢 Testing workspace:', workspace.name)
  console.log('👤 Current user:', currentUser.email)
  
  // Get member UIDs
  const memberUids = Object.keys(workspace.members)
  console.log('👥 Total members:', memberUids.length)
  console.log('   UIDs:', memberUids)
  
  // Check for duplicate UIDs
  const uniqueUids = [...new Set(memberUids)]
  if (uniqueUids.length !== memberUids.length) {
    console.error('❌ DUPLICATE UIDs FOUND in workspace.members!')
    console.error('   Total:', memberUids.length, 'Unique:', uniqueUids.length)
    return { success: false, error: 'Duplicate UIDs in workspace' }
  }
  console.log('✅ No duplicate UIDs in workspace.members')
  
  // Fetch all profiles
  const profiles = await userStore.getUserProfiles(memberUids)
  console.log('📋 Fetched', profiles.length, 'profiles')
  
  // Build member list (same logic as MemberManagementModal)
  const memberList = memberUids.map(uid => {
    const profile = profiles.find(p => p.uid === uid)
    const role = workspace.members[uid]
    
    let email
    if (profile?.email) {
      email = profile.email
    } else if (uid === currentUser?.uid) {
      email = currentUser.email
    } else {
      email = `user-${uid.slice(0, 8)}@example.com`
    }
    
    return {
      uid,
      role,
      email,
      isOwner: uid === workspace.ownerId,
      isCurrentUser: uid === currentUser.uid
    }
  })
  
  console.log('📊 Member List:')
  memberList.forEach((member, index) => {
    const ownerBadge = member.isOwner ? '👑' : ''
    const youBadge = member.isCurrentUser ? '(You)' : ''
    const emailStatus = member.email.includes('@example.com') ? '⚠️' : '✅'
    console.log(`  ${index + 1}. ${emailStatus} ${member.email} (${member.role}) ${ownerBadge} ${youBadge}`)
  })
  
  // Check for duplicate emails
  const emails = memberList.map(m => m.email)
  const uniqueEmails = [...new Set(emails)]
  
  if (uniqueEmails.length !== emails.length) {
    console.error('❌ DUPLICATE EMAILS FOUND!')
    console.error('   Total:', emails.length, 'Unique:', uniqueEmails.length)
    
    // Find duplicates
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index)
    console.error('   Duplicate emails:', [...new Set(duplicates)])
    
    return { success: false, error: 'Duplicate emails in member list', duplicates }
  }
  
  console.log('✅ No duplicate emails found')
  
  // Check if current user appears only once
  const currentUserCount = memberList.filter(m => m.isCurrentUser).length
  if (currentUserCount !== 1) {
    console.error('❌ Current user appears', currentUserCount, 'times (should be 1)')
    return { success: false, error: 'Current user appears multiple times' }
  }
  console.log('✅ Current user appears exactly once')
  
  // Check if owner crown is correct
  const ownersCount = memberList.filter(m => m.isOwner).length
  if (ownersCount !== 1) {
    console.error('❌ Owner count:', ownersCount, '(should be 1)')
    return { success: false, error: 'Multiple or no owners found' }
  }
  console.log('✅ Exactly one owner found')
  
  // Check for missing profiles
  const missingProfiles = memberList.filter(m => m.email.includes('@example.com'))
  if (missingProfiles.length > 0) {
    console.warn('⚠️ Missing profiles:', missingProfiles.length)
    missingProfiles.forEach(m => {
      console.warn(`   - UID: ${m.uid} (${m.role})`)
    })
  } else {
    console.log('✅ All members have real emails')
  }
  
  console.log('🎉 Duplicate members test complete!')
  
  return {
    success: true,
    totalMembers: memberList.length,
    uniqueEmails: uniqueEmails.length,
    missingProfiles: missingProfiles.length,
    memberList
  }
}
