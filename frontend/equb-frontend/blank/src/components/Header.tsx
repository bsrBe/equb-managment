import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const history = useHistory();
    const [user, setUser] = useState<{ name: string; photo?: string } | null>(null);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch {
            console.error('Failed to parse user from storage');
        }
    }, []);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="flex justify-between items-center px-4 bg-white border-b border-gray-100 relative shadow-sm z-30" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))', paddingBottom: '1rem' }}>
            {/* Title / Brand Section */}
            <div className="flex flex-col">
                {title ? (
                    <h1 className="text-xl font-black text-equb-text-dark tracking-tight">
                        {title}
                    </h1>
                ) : (
                    <>
                        <span className="text-[10px] font-black text-equb-primary uppercase tracking-[0.2em] mb-0.5">EqubDigital</span>
                        <span className="text-lg font-black text-equb-text-dark leading-none">
                            Dashboard
                        </span>
                    </>
                )}
            </div>

            {/* Profile Section on the Right */}
            <div
                onClick={() => history.push('/profile')}
                className="flex items-center gap-3 active:scale-95 transition-all cursor-pointer"
            >
                {!title && (
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-[10px] font-bold text-equb-text-gray uppercase tracking-wider">Admin</span>
                        <span className="text-sm font-bold text-equb-text-dark leading-tight">
                            {user?.name || 'Admin'}
                        </span>
                    </div>
                )}

                {/* Avatar / Initials Squircle */}
                <div className="w-10 h-10 rounded-xl bg-equb-primary/10 overflow-hidden flex items-center justify-center border border-equb-primary/10 shadow-sm" style={{ borderRadius: '12px' }}>
                    {user?.photo ? (
                        <img
                            src={user.photo}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-equb-primary font-black text-sm">
                            {user?.name ? getInitials(user.name) : 'A'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;




