import { create } from 'zustand'
import aiService from '../services/aiService'
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'

const useAIStore = create((set, get) => ({
  // State
  isAvailable: false,
  isLoading: false,
  currentResult: null,
  currentAction: null,
  error: null,
  dailyUsage: 0,
  maxDailyUsage: 20,
  
  // Actions
  checkAvailability: async () => {
    try {
      const result = await aiService.checkAvailability()
      set({ isAvailable: result.available, error: result.error || null })
      return result.available
    } catch (error) {
      set({ isAvailable: false, error: error.message })
      return false
    }
  },

  checkDailyUsage: async (userId) => {
    if (!userId) return false

    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const usageRef = doc(db, 'aiUsage', `${userId}_${today}`)
      const usageDoc = await getDoc(usageRef)
      
      const usage = usageDoc.exists() ? usageDoc.data().count : 0
      set({ dailyUsage: usage })
      
      return usage < get().maxDailyUsage
    } catch (error) {
      console.error('Error checking daily usage:', error)
      return true // Allow usage if we can't check
    }
  },

  incrementUsage: async (userId) => {
    if (!userId) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const usageRef = doc(db, 'aiUsage', `${userId}_${today}`)
      const usageDoc = await getDoc(usageRef)
      
      if (usageDoc.exists()) {
        await updateDoc(usageRef, {
          count: usageDoc.data().count + 1,
          lastUsed: serverTimestamp()
        })
        set({ dailyUsage: usageDoc.data().count + 1 })
      } else {
        await setDoc(usageRef, {
          userId,
          date: today,
          count: 1,
          createdAt: serverTimestamp(),
          lastUsed: serverTimestamp()
        })
        set({ dailyUsage: 1 })
      }
    } catch (error) {
      console.error('Error incrementing usage:', error)
    }
  },

  generateDocumentation: async (requestData, responseData, userId) => {
    const canUse = await get().checkDailyUsage(userId)
    if (!canUse) {
      throw new Error('Daily AI limit reached. Try again tomorrow.')
    }

    set({ isLoading: true, error: null, currentAction: 'documentation' })
    
    try {
      const result = await aiService.generateDocumentation(requestData, responseData, userId)
      await get().incrementUsage(userId)
      set({ 
        currentResult: result, 
        isLoading: false,
        currentAction: 'documentation'
      })
      return result
    } catch (error) {
      set({ error: error.message, isLoading: false, currentAction: null })
      throw error
    }
  },

  explainResponse: async (responseData, userId) => {
    const canUse = await get().checkDailyUsage(userId)
    if (!canUse) {
      throw new Error('Daily AI limit reached. Try again tomorrow.')
    }

    set({ isLoading: true, error: null, currentAction: 'explain' })
    
    try {
      const result = await aiService.explainResponse(responseData, userId)
      await get().incrementUsage(userId)
      set({ 
        currentResult: result, 
        isLoading: false,
        currentAction: 'explain'
      })
      return result
    } catch (error) {
      set({ error: error.message, isLoading: false, currentAction: null })
      throw error
    }
  },

  generateTestCases: async (requestData, responseData, userId) => {
    const canUse = await get().checkDailyUsage(userId)
    if (!canUse) {
      throw new Error('Daily AI limit reached. Try again tomorrow.')
    }

    set({ isLoading: true, error: null, currentAction: 'testcases' })
    
    try {
      const result = await aiService.generateTestCases(requestData, responseData, userId)
      await get().incrementUsage(userId)
      set({ 
        currentResult: result, 
        isLoading: false,
        currentAction: 'testcases'
      })
      return result
    } catch (error) {
      set({ error: error.message, isLoading: false, currentAction: null })
      throw error
    }
  },

  generateCodeSnippets: async (requestData, userId) => {
    const canUse = await get().checkDailyUsage(userId)
    if (!canUse) {
      throw new Error('Daily AI limit reached. Try again tomorrow.')
    }

    set({ isLoading: true, error: null, currentAction: 'codesnippets' })
    
    try {
      const result = await aiService.generateCodeSnippets(requestData, userId)
      await get().incrementUsage(userId)
      set({ 
        currentResult: result, 
        isLoading: false,
        currentAction: 'codesnippets'
      })
      return result
    } catch (error) {
      set({ error: error.message, isLoading: false, currentAction: null })
      throw error
    }
  },

  askQuestion: async (requestData, responseData, userQuestion, userId) => {
    const canUse = await get().checkDailyUsage(userId)
    if (!canUse) {
      throw new Error('Daily AI limit reached. Try again tomorrow.')
    }

    set({ isLoading: true, error: null, currentAction: 'chat' })
    
    try {
      const result = await aiService.askQuestion(requestData, responseData, userQuestion, userId)
      await get().incrementUsage(userId)
      set({ 
        currentResult: result, 
        isLoading: false,
        currentAction: 'chat'
      })
      return result
    } catch (error) {
      set({ error: error.message, isLoading: false, currentAction: null })
      throw error
    }
  },

  clearResult: () => {
    set({ currentResult: null, currentAction: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  }
}))

export { useAIStore }