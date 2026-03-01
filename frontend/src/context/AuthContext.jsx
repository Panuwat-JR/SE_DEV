// src/context/AuthContext.jsx
// บริหาร role ของผู้ใช้ — ทุกอย่างอยู่ใน state เท่านั้น (reset on F5)
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // role: 'participant' | 'employee' | 'executive'
    const [role, setRole] = useState(null);
    // teamRole เฉพาะ participant: 'leader' | 'member'
    const [teamRole, setTeamRole] = useState('leader');

    const login = (selectedRole) => {
        setRole(selectedRole);
    };

    const logout = () => {
        setRole(null);
        setTeamRole('leader');
    };

    return (
        <AuthContext.Provider value={{ role, teamRole, setTeamRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthContext;
