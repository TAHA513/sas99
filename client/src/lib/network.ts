import { create } from 'zustand'

type NetworkState = {
  isOnline: boolean
  setIsOnline: (status: boolean) => void
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: navigator.onLine,
  setIsOnline: (status) => set({ isOnline: status }),
}))

export const initNetworkListener = () => {
  const { setIsOnline } = useNetworkStore.getState()
  
  window.addEventListener('online', () => setIsOnline(true))
  window.addEventListener('offline', () => setIsOnline(false))
}

export const requiresInternet = (feature: 'marketing' | 'social' | 'sync') => {
  const { isOnline } = useNetworkStore.getState()
  
  const messages = {
    marketing: 'تتطلب إدارة الحملات التسويقية اتصالاً بالإنترنت',
    social: 'تتطلب ميزات التواصل الاجتماعي اتصالاً بالإنترنت',
    sync: 'تتطلب مزامنة البيانات اتصالاً بالإنترنت'
  }
  
  return {
    allowed: isOnline,
    message: messages[feature]
  }
}
