import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import { personAdd, chevronForward } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { equbApi } from '../services/equbApi';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import { User } from '../types/equb.types';

const Community: React.FC = () => {
    const history = useHistory();
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const data = await equbApi.getUsers(searchQuery);
                setUsers(data);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-[#f5f8f8] min-h-screen text-[#111818] font-sans pb-24">
                    {/* Header */}
                    <div className="bg-white p-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-extrabold tracking-tight">Community</h1>
                            <button
                                onClick={() => history.push('/register-member')}
                                className="w-10 h-10 rounded-full bg-[#007f80]/10 text-[#007f80] flex items-center justify-center hover:bg-[#007f80]/20 transition-colors"
                            >
                                <IonIcon icon={personAdd} className="text-xl" />
                            </button>
                        </div>

                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search members by name or phone..."
                        />
                    </div>

                    {/* Users List */}
                    <div className="px-4 py-4 space-y-3">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <IonSpinner name="crescent" className="text-[#007f80]" />
                            </div>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform"
                                    onClick={() => history.push(`/user-insights/${user.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-full bg-gray-100 bg-cover bg-center border border-gray-100"
                                            style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${user.id})` }}
                                        />
                                        <div>
                                            <p className="font-bold text-[#111818] text-lg leading-tight">{user.name}</p>
                                            <p className="text-sm text-gray-500 font-medium mt-0.5">{user.phone}</p>
                                        </div>
                                    </div>
                                    <IonIcon icon={chevronForward} className="text-gray-300" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <p>No members found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </IonContent>
            <BottomNav />
        </IonPage>
    );
};

export default Community;
