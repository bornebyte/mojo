/**
 * Cache utility functions for localStorage management
 * Role-based expiration times:
 * - Students: 1 hour (use less frequently)
 * - Staff (admin/warden/canteen): 30 minutes (use more frequently)
 */

export type UserRole = "student" | "warden" | "admin" | "canteen manager";

/**
 * Get cache expiry time in milliseconds based on user role
 */
export function getCacheExpiryTime(role?: UserRole): number {
    if (!role) return 30 * 60 * 1000; // Default 30 minutes

    switch (role) {
        case "student":
            return 60 * 60 * 1000; // 1 hour for students
        case "admin":
        case "warden":
        case "canteen manager":
            return 30 * 60 * 1000; // 30 minutes for staff
        default:
            return 30 * 60 * 1000;
    }
}

/**
 * Check if cached data is still valid
 */
export function isCacheValid(timestamp: number, role?: UserRole): boolean {
    const now = Date.now();
    const expiryTime = getCacheExpiryTime(role);
    return now - timestamp < expiryTime;
}

/**
 * Get data from cache if valid
 */
export function getFromCache<T>(key: string, role?: UserRole): T | null {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);

        if (isCacheValid(timestamp, role)) {
            return data as T;
        }

        // Cache expired, remove it
        localStorage.removeItem(key);
        return null;
    } catch (error) {
        console.error("Error reading from cache:", error);
        return null;
    }
}

/**
 * Save data to cache with timestamp
 */
export function saveToCache<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error("Error saving to cache:", error);
    }
}

/**
 * Clear specific cache key
 */
export function clearCache(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Error clearing cache:", error);
    }
}

/**
 * Clear all cache keys matching a pattern
 */
export function clearCachePattern(pattern: string): void {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.includes(pattern)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error("Error clearing cache pattern:", error);
    }
}

/**
 * Get cache info for debugging
 */
export function getCacheInfo(key: string): { exists: boolean; age?: number; expiresIn?: number } {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return { exists: false };

        const { timestamp } = JSON.parse(cached);
        const now = Date.now();
        const age = now - timestamp;

        return {
            exists: true,
            age,
            expiresIn: Math.max(0, 30 * 60 * 1000 - age) // Default 30 min
        };
    } catch (error) {
        return { exists: false };
    }
}
