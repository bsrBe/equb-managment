import { useState, useEffect } from 'react';

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
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
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100 relative h-16">
            <div className="flex items-center gap-3 z-10">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-equb-primary/10 overflow-hidden flex items-center justify-center border border-equb-primary/10">
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

                {!title && (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-equb-text-gray uppercase tracking-wider">Admin</span>
                        <span className="text-base font-bold text-equb-text-dark leading-tight">
                            {user?.name || 'Administrator'}
                        </span>
                    </div>
                )}
            </div>

            {title && (
                <h1 className="text-base font-black text-equb-text-dark absolute left-1/2 transform -translate-x-1/2 uppercase tracking-tight z-0">
                    {title}
                </h1>
            ) /* Spacer for flex */ && <div className="w-10"></div>}
        </div>
    );
};

export default Header;




