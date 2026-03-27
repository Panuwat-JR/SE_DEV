// src/context/AuthContext.jsx
// บริหาร role ของผู้ใช้ — ทุกอย่างอยู่ใน state เท่านั้น (reset on F5)
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { participantFetch } from '../lib/participantApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [role, setRole] = useState(null);
    const [teamRole, setTeamRole] = useState('member');
    const [participantProfile, setParticipantProfile] = useState(null);
    const [participantProfileLoading, setParticipantProfileLoading] = useState(false);

    const refreshParticipantProfile = useCallback(async () => {
        setParticipantProfileLoading(true);
        try {
            const res = await participantFetch('/api/participants-data/profile');
            if (!res.ok) {
                setParticipantProfile(null);
                return;
            }
            const data = await res.json();
            setParticipantProfile(data);
            setTeamRole(data.isTeamLeader ? 'leader' : 'member');
        } catch {
            setParticipantProfile(null);
        } finally {
            setParticipantProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        if (role === 'participant') {
            refreshParticipantProfile();
        } else {
            setParticipantProfile(null);
            setParticipantProfileLoading(false);
        }
    }, [role, refreshParticipantProfile]);

    const login = (selectedRole) => {
        setRole(selectedRole);
    };

    const logout = () => {
        setRole(null);
        setTeamRole('member');
        setParticipantProfile(null);
        setParticipantProfileLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                role,
                teamRole,
                setTeamRole,
                login,
                logout,
                participantProfile,
                participantProfileLoading,
                refreshParticipantProfile,
            }}
        >
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
