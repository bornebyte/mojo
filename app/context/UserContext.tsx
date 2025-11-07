"use client";

import { UserPayload } from '@/lib/types';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { getUserFromTokenCookie } from '../actions';
import { LoaderCircle } from 'lucide-react';

interface UserContextType {
    user: UserPayload | null;
    setUser: (user: UserPayload | null) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserPayload | null>(null);
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUserFromTokenCookie();
                if (userData) {
                    setUser(userData);
                }
            } catch (error) {
                console.error("Failed to fetch user from token:", error);
                // Handle error, e.g., clear invalid token from cookies
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []); // Empty dependency array means this effect runs once after the initial render

    if (loading) {
        return <section className='w-full h-[100vh] flex justify-center items-center text-xl'>
            <div className='flex justify-center items-center gap-6'>
                <LoaderCircle className='animate-spin' /> Loading user data...
            </div>
        </section>
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
