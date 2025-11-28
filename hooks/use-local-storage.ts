import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
    key: string;
    fetchFn: () => Promise<any>;
    expiryMinutes?: number;
}

interface CachedData<T> {
    data: T;
    timestamp: number;
}

export function useLocalStorage<T>(options: CacheOptions) {
    const { key, fetchFn, expiryMinutes = 5 } = options;
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const isExpired = useCallback((timestamp: number) => {
        const now = Date.now();
        const expiryMs = expiryMinutes * 60 * 1000;
        return now - timestamp > expiryMs;
    }, [expiryMinutes]);

    const loadFromCache = useCallback(() => {
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                const parsedCache: CachedData<T> = JSON.parse(cached);
                if (!isExpired(parsedCache.timestamp)) {
                    setData(parsedCache.data);
                    setLoading(false);
                    return true;
                }
            }
        } catch (err) {
            console.error('Error loading from cache:', err);
        }
        return false;
    }, [key, isExpired]);

    const saveToCache = useCallback((newData: T) => {
        try {
            const cacheData: CachedData<T> = {
                data: newData,
                timestamp: Date.now(),
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (err) {
            console.error('Error saving to cache:', err);
        }
    }, [key]);

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && loadFromCache()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            setData(result);
            saveToCache(result);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, loadFromCache, saveToCache]);

    const refresh = useCallback(() => {
        return fetchData(true);
    }, [fetchData]);

    const clearCache = useCallback(() => {
        localStorage.removeItem(key);
        setData(null);
    }, [key]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refresh,
        clearCache,
    };
}
