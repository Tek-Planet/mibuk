import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BusinessInfo {
  business_name: string
  business_type: string
  currency: string
}

export function useBusinessInfo() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    // For now, just use the default business name from translations
    // Once the database is set up, this can be updated to fetch real business info
    setBusinessInfo({
      business_name: t('business.defaultname'),
      business_type: 'retail',
      currency: 'SLL'
    })
    setLoading(false)
  }, [t])

  return { businessInfo, loading }
}