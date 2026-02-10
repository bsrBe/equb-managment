import { IonIcon } from '@ionic/react';
import { grid, apps, receipt, people, settings } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
    const history = useHistory();
    const location = useLocation();

    const tabs = [
        { path: '/dashboard', icon: grid, label: 'DASHBOARD' },
        { path: '/equbs', icon: apps, label: 'EQUBS' },
        { path: '/members', icon: people, label: 'MEMBERS' },
        { path: '/ledger', icon: receipt, label: 'LEDGER' },
        { path: '/setup', icon: settings, label: 'SETUP' },
    ];

    const handleTabClick = (path: string) => {
        history.push(path);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 z-50 pt-3 pb-6 px-4">
            <div className="flex justify-around items-end max-w-md mx-auto">
                {tabs.map((tab, index) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={index}
                            onClick={() => handleTabClick(tab.path)}
                            className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-all active:scale-95 ${isActive ? 'text-equb-primary' : 'text-gray-400'
                                }`}
                        >
                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${isActive ? 'bg-equb-primary/10' : 'bg-transparent'
                                }`}>
                                <IonIcon icon={tab.icon} className={`text-2xl ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
                            </div>
                            <span className={`text-[8px] font-black tracking-[0.05em] uppercase transition-all ${isActive ? 'opacity-100' : 'opacity-60'
                                }`}>
                                {tab.label}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-1 w-1 h-1 bg-equb-primary rounded-full animate-pulse"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
