import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useNetworkStore, requiresInternet } from '@/lib/network'

type Props = {
  feature: 'marketing' | 'social' | 'sync'
  children: React.ReactNode
}

export const NetworkAwareFeature = ({ feature, children }: Props) => {
  const { toast } = useToast()
  const isOnline = useNetworkStore((state) => state.isOnline)

  useEffect(() => {
    if (!isOnline) {
      const { message } = requiresInternet(feature)
      toast({
        title: 'تنبيه الاتصال',
        description: message,
        variant: 'destructive',
      })
    }
  }, [isOnline, feature])

  if (!isOnline) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">
          هذه الميزة غير متوفرة حالياً لعدم وجود اتصال بالإنترنت
        </p>
      </div>
    )
  }

  return <>{children}</>
}
