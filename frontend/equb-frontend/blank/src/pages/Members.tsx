import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import { search, personAdd, chevronForward } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { equbApi } from '../services/equbApi';
import BottomNav from '../components/BottomNav';
import { Equb, EqubMember } from '../types/equb.types';

const Members: React.FC = () => {
    const history = useHistory();
    const [members, setMembers] = useState<EqubMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchMembers = async () => {
        try {
            setIsLoading(true);
            const data = await equbApi.getAll();
            // Flatten members from all equbs and keep unique members by member ID
            const allMembers: EqubMember[] = [];
            data.forEach((equb: Equb) => {
                if (equb.members) {
                    equb.members.forEach((member) => {
                        allMembers.push({ ...member, equb: equb });
                    });
                }
            });

            // Remove duplicates based on member ID (not user ID)
            const uniqueMembers = Array.from(new Map(allMembers.map((m) => [m.id, m])).values());
            setMembers(uniqueMembers);
        } catch (err) {
            console.error('Failed to fetch members:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const filteredMembers = members.filter(member =>
        member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user.phone?.includes(searchQuery)
    );

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-[#f5f8f8] min-h-screen text-[#111818] font-sans pb-24">
                    {/* Header */}
                    <div className="bg-white p-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-extrabold tracking-tight">Members</h1>
                            <button
                                onClick={() => history.push('/register-member')}
                                className="w-12 h-12 rounded-2xl bg-[#007f80] text-white flex items-center justify-center shadow-lg hover:bg-[#006666] active:scale-95 transition-all"
                            >
                                <IonIcon icon={personAdd} className="text-2xl" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IonIcon icon={search} className="text-gray-400 text-xl" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-base focus:ring-2 focus:ring-[#007f80]/20 placeholder-gray-400 text-[#111818]"
                                placeholder="Search by name or number..."
                            />
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="p-6 pt-4">
                        <div className="bg-white rounded-3xl p-6 text-[#111818] flex justify-between items-center shadow-sm border border-[#dae7e7]">
                            <div>
                                <p className="text-[#608a8a] text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Total Members</p>
                                <p className="text-3xl font-extrabold">{members.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#608a8a] text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Active Contributors</p>
                                <p className="text-3xl font-extrabold text-[#007f80]">{members.filter((m) => m.isActive).length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="px-6 space-y-4">
                        <h2 className="text-[#608a8a] text-xs font-bold uppercase tracking-[0.15em] px-1">Directory</h2>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <IonSpinner name="crescent" color="primary" />
                                <p className="mt-4 font-medium">Syncing directory...</p>
                            </div>
                        ) : filteredMembers.length > 0 ? (
                            filteredMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="group bg-white rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-[#007f80]/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    onClick={() => history.push(`/user-insights/${member.user.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#0bdada]/10 flex items-center justify-center overflow-hidden border border-[#0bdada]/20">
                                            <img
                                                src={`https://i.pravatar.cc/150?u=${member.user.id}`}
                                                alt={member.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-[#111818] leading-tight">{member.user.name}</p>
                                            <p className="text-sm text-[#608a8a] mt-0.5">{member.user.phone || 'No phone recorded'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 ${member.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'} text-[10px] font-bold rounded-full uppercase tracking-wider`}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <IonIcon icon={chevronForward} className="text-gray-300 group-hover:text-[#007f80] transition-colors" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                                <IonIcon icon={peopleOutline} className="text-6xl text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium">No members found</p>
                                <button
                                    onClick={() => history.push('/register-member')}
                                    className="mt-6 px-6 py-3 bg-[#0bdada]/10 text-[#0bdada] font-bold rounded-2xl hover:bg-[#0bdada]/20 transition-all"
                                >
                                    Add New Member
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </IonContent>
            <BottomNav />
        </IonPage>
    );
};

// Placeholder icon for empty state if needed
const peopleOutline = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M402 168c-2.93 40.67-33.1 72-71.4 72s-68.47-31.33-71.4-72c-3-41.49 23.37-72 71.4-72s74.38 30.51 71.4 72z' fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='32'/><path d='M332 304c-63 0-117 52.48-117 117.15 0 6.62 5.38 10.85 12 10.85h210c6.62 0 12-4.23 12-10.85 0-64.67-54-117.15-117-117.15z' fill='none' stroke='currentColor' stroke-miterlimit='10' stroke-width='32'/><path d='M169.57 232c-3.06 24-22.31 48-40.57 48s-37.51-24-40.57-48c-3-24 5.37-48 40.57-48s43.51 24 40.57 48z' fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='32'/><path d='M129 320c-38.06 0-76.5 24-76.5 64 0 4.08 3.32 8 7.33 8h138.34c4.01 0 7.33-3.92 7.33-8 0-40-38.44-64-76.5-64z' fill='none' stroke='currentColor' stroke-miterlimit='10' stroke-width='32'/></svg>";

export default Members;
