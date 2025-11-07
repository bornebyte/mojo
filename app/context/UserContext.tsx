"use client";

import { UserPayload } from "@/lib/types";
import React, { createContext, useState, ReactNode } from "react";

interface UserContextType {
    user: UserPayload | null;
    setUser: (user: UserPayload | null) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserPayload | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;

