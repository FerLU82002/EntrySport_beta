"use client"

import { useState, useEffect, useCallback } from "react"

interface CacheOptions {
  key: string
  ttl?: number // Time to live en milisegundos (default: 5 minutos)
  revalidateOnMount?: boolean
}

interface CacheData<T> {
  data: T
  timestamp: number
}

/**
 * Hook para cachear datos en localStorage con revalidación automática
 * 
 * @example
 * const { data, setCache, clearCache, isStale } = useLocalCache<Zona[]>({
 *   key: 'zonas-dueno-123',
 *   ttl: 5 * 60 * 1000, // 5 minutos
 *   revalidateOnMount: true
 * })
 */
export function useLocalCache<T>(options: CacheOptions) {
  const { key, ttl = 5 * 60 * 1000, revalidateOnMount = true } = options
  const [data, setData] = useState<T | null>(null)
  const [isStale, setIsStale] = useState(false)

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const loadCache = () => {
      try {
        const cached = localStorage.getItem(key)
        if (!cached) {
          setIsStale(true)
          return
        }

        const parsed: CacheData<T> = JSON.parse(cached)
        const now = Date.now()
        const age = now - parsed.timestamp

        // Si los datos están frescos, usarlos
        if (age < ttl) {
      //           console.log(`📦 Cache HIT para "${key}" (edad: ${Math.round(age / 1000)}s)`)
          setData(parsed.data)
          setIsStale(false)
        } else {
      //           console.log(`⏰ Cache STALE para "${key}" (edad: ${Math.round(age / 1000)}s)`)
          setData(parsed.data) // Usar datos viejos mientras revalidamos
          setIsStale(true)
        }
      } catch (error) {
        console.error(`❌ Error cargando cache "${key}":`, error)
        setIsStale(true)
      }
    }

    loadCache()
  }, [key, ttl])

  // Guardar datos en cache
  const setCache = useCallback((newData: T) => {
    try {
      const cacheData: CacheData<T> = {
        data: newData,
        timestamp: Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
      setData(newData)
      setIsStale(false)
    } catch (error) {
      console.error(`❌ Error guardando cache "${key}":`, error)
    }
  }, [key])

  // Limpiar cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setData(null)
      setIsStale(true)
    } catch (error) {
      console.error(`❌ Error limpiando cache "${key}":`, error)
    }
  }, [key])

  // Verificar si el cache existe
  const hasCache = useCallback(() => {
    return localStorage.getItem(key) !== null
  }, [key])

  return {
    data,
    setCache,
    clearCache,
    hasCache,
    isStale,
  }
}

/**
 * Hook mejorado que combina cache + fetch de Supabase
 * 
 * @example
 * const { data, isLoading, refresh } = useCachedQuery({
 *   cacheKey: 'mis-zonas-123',
 *   queryFn: async () => {
 *     const { data } = await supabase.from('zonas').select('*')
 *     return data
 *   },
 *   ttl: 5 * 60 * 1000
 * })
 */
export function useCachedQuery<T>(options: {
  cacheKey: string
  queryFn: () => Promise<T | null>
  ttl?: number
  enabled?: boolean
}) {
  const { cacheKey, queryFn, ttl = 5 * 60 * 1000, enabled = true } = options
  const { data: cachedData, setCache, isStale } = useLocalCache<T>({ key: cacheKey, ttl })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para refrescar datos
  const refresh = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)
      const freshData = await queryFn()
      
      if (freshData) {
        setCache(freshData)
      }
    } catch (err) {
      console.error(`❌ Error fetching "${cacheKey}":`, err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [cacheKey, queryFn, setCache, enabled])

  // Auto-fetch si no hay cache o está stale
  useEffect(() => {
    if (enabled && (cachedData === null || isStale)) {
      refresh()
    }
  }, [enabled, cachedData, isStale, refresh])

  return {
    data: cachedData,
    isLoading,
    error,
    refresh,
    isStale,
  }
}
