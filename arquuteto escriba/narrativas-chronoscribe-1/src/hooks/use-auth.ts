import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const useAuth = () => {
    const { data: session, status } = useSession();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(status === 'authenticated');
    }, [status]);

    return { isAuthenticated, session };
};

export default useAuth;