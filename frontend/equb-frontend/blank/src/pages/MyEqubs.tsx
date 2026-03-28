// import { IonContent, IonPage, IonIcon } from '@ionic/react';
// import { add } from 'ionicons/icons';
// import SearchBar from '../components/SearchBar';
// import EqubCard from '../components/EqubCard';
// import BottomNav from '../components/BottomNav';
// import Header from '../components/Header';
// import CreateEqubModal from '../components/CreateEqubModal';
// import { useState, useEffect } from 'react';
// import { useHistory } from 'react-router-dom';
// import { Equb, ApiError } from '../types/equb.types';
// import { equbApi } from '../services/equbApi';

// const MyEqubs: React.FC = () => {
//     const history = useHistory();
//     const [searchQuery, setSearchQuery] = useState('');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [equbs, setEqubs] = useState<Equb[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');

//     // Fetch equbs from API
//     const fetchEqubs = async () => {
//         try {
//             setIsLoading(true);
//             const data = await equbApi.getAll();
//             setEqubs(data);
//             setError(null);
//         } catch (err) {
//             const error = err as ApiError;
//             setError(error.response?.data?.message || 'Failed to load equbs');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchEqubs();
//     }, []);

//     const handleEqubClick = (id: string) => {
//         history.push(`/equbs/${id}`);
//     };

//     const handleCreateSuccess = () => {
//         fetchEqubs(); // Refresh the list
//     };

//     const filteredEqubs = equbs
//         .filter(equb => equb.name.toLowerCase().includes(searchQuery.toLowerCase()))
//         .filter(equb => {
//             if (statusFilter === 'All') return true;
//             if (statusFilter === 'Active') return equb.status === 'ACTIVE';
//             if (statusFilter === 'Completed') return equb.status === 'COMPLETED';
//             return true;
//         });

//     // Calculate progress percentage based on current round
//     const calculateProgress = (equb: Equb) => {
//         if (!equb.periods || equb.periods.length === 0) return 0;
//         return Math.round((equb.currentRound / equb.periods.length) * 100);
//     };



//     return (
//         <IonPage>
//             <IonContent fullscreen>
//                 <div className="bg-equb-bg min-h-screen pb-20">
//                     <Header title="My Equbs" />

//                     {/* Search Bar */}
//                     <SearchBar
//                         value={searchQuery}
//                         onChange={setSearchQuery}
//                         placeholder="Search your Equbs"
//                     />

//                     {/* Status Filter Navigation */}
//                     <div className="px-4 pb-2">
//                         <div className="grid grid-cols-3 gap-4 p-1">
//                             {(['All', 'Active', 'Completed'] as const).map((filter) => (
//                                 <button
//                                     key={filter}
//                                     onClick={() => setStatusFilter(filter)}
//                                     className={`flex items-center justify-center !rounded-full min-h-[40px] px-2 text-sm font-medium transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${statusFilter === filter
//                                         ? 'bg-[#008080] text-white shadow-sm'
//                                         : 'bg-[#F4F5F8] text-[#608A8A] hover:bg-gray-200 hover:text-gray-700'
//                                         }`}
//                                 >
//                                     {filter}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Section Header */}
//                     <div className="flex justify-between items-center px-4 mb-3 mt-2">
//                         <h2 className="text-sm font-semibold text-equb-text-gray uppercase tracking-wide">
//                             {statusFilter === 'All' ? 'ALL EQUBS' : statusFilter === 'Active' ? 'ACTIVE EQUBS' : 'COMPLETED EQUBS'}
//                         </h2>
//                         <span className="text-sm font-semibold text-equb-primary">
//                             {filteredEqubs.length} {filteredEqubs.length === 1 ? 'Equb' : 'Equbs'}
//                         </span>
//                     </div>

//                     {/* Loading State */}
//                     {isLoading && (
//                         <div className="text-center py-8">
//                             <p className="text-equb-text-gray">Loading equbs...</p>
//                         </div>
//                     )}

//                     {/* Error State */}
//                     {error && !isLoading && (
//                         <div className="mx-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
//                             <p className="text-sm text-yellow-800">{error}</p>
//                             <p className="text-xs text-yellow-600 mt-1">Showing sample data</p>
//                         </div>
//                     )}

//                     {/* Equb Cards */}
//                     {!isLoading && (
//                         <div className="pb-4">
//                             {filteredEqubs.length > 0 ? (
//                                 filteredEqubs.map(equb => (
//                                     <EqubCard
//                                         key={equb.id}
//                                         id={equb.id}
//                                         name={equb.name}
//                                         currentRound={equb.currentRound}
//                                         totalRounds={equb.periods?.length || 12}
//                                         progress={calculateProgress(equb)}
//                                         onClick={() => handleEqubClick(equb.id)}
//                                     />
//                                 ))
//                             ) : (
//                                 <div className="text-center py-8">
//                                     <p className="text-equb-text-gray">No equbs found</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Floating Action Button */}
//                     <button
//                         onClick={() => setIsModalOpen(true)}
//                         className="fixed bottom-24 right-6 w-14 h-14 bg-equb-primary !rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,128,128,0.5)] flex items-center justify-center hover:bg-opacity-90 active:scale-90 transition-all z-40"
//                         style={{ borderRadius: '16px' }}
//                     >
//                         <IonIcon icon={add} className="text-3xl text-white" />
//                     </button>
//                 </div>
//             </IonContent>

//             <BottomNav />

//             {/* Create Equb Modal */}
//             <CreateEqubModal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 onSuccess={handleCreateSuccess}
//             />
//         </IonPage>
//     );
// };



// export default MyEqubs;



import { IonContent, IonPage, IonIcon, useIonViewWillEnter } from '@ionic/react';
import { add, person } from 'ionicons/icons'; // Added person icon
import SearchBar from '../components/SearchBar';
import EqubCard from '../components/EqubCard';
import BottomNav from '../components/BottomNav';
import CreateEqubModal from '../components/CreateEqubModal';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Equb, ApiError } from '../types/equb.types';
import { equbApi } from '../services/equbApi';

const MyEqubs: React.FC = () => {
    const history = useHistory();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [equbs, setEqubs] = useState<Equb[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');

    const fetchEqubs = async () => {
        try {
            setIsLoading(true);
            const data = await equbApi.getAll();
            setEqubs(data);
            setError(null);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Failed to load equbs');
        } finally {
            setIsLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        fetchEqubs();
    });

    const filteredEqubs = equbs
        .filter(equb => equb.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(equb => {
            if (statusFilter === 'All') return true;
            if (statusFilter === 'Active') return equb.status === 'ACTIVE' || equb.status === 'PENDING';
            if (statusFilter === 'Completed') return equb.status === 'COMPLETED';
            return true;
        });

    const calculateProgress = (equb: Equb) => {
        if (equb.status === 'PENDING') return 0;
        if (!equb.periods || equb.periods.length === 0) return 0;
        return Math.round((equb.currentRound / equb.periods.length) * 100);
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-[#f5f8f8] min-h-screen pb-24">

                    {/* CUSTOM HEADER with Top-Right Profile Button */}
                    <div className="flex items-center bg-white px-4 justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))', paddingBottom: '1rem' }}>
                        <div className="w-10"></div> {/* Spacer for symmetry */}
                        <h2 className="text-[#101818] text-lg font-bold tracking-tight text-center">
                            My Equbs
                        </h2>
                        {/* PROFILE SQUIRCLE */}
                        <button
                            onClick={() => history.push('/profile')}
                            className="w-10 h-10 bg-[#007f80]/10 text-[#007f80] font-bold !rounded-xl flex items-center justify-center border border-[#007f80]/20 active:scale-95 transition-all"
                            style={{ borderRadius: '12px' }}
                        >
                            <span className="text-xs">BA</span>
                        </button>
                    </div>

                    {/* Search Bar - Make sure your SearchBar component supports rounding adjustments */}
                    <div className="mt-2">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search your Equbs"
                        />
                    </div>

                    {/* STATUS FILTER - Converted from "Pills" to "Squircles" */}
                    <div className="px-4 pb-4">
                        <div className="grid grid-cols-3 gap-3">
                            {(['All', 'Active', 'Completed'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`flex items-center justify-center h-11 px-2 text-sm font-bold transition-all !rounded-xl ${statusFilter === filter
                                        ? 'bg-[#008080] text-white shadow-[0_8px_20px_-4px_rgba(0,128,128,0.4)]'
                                        : 'bg-white text-[#608A8A] border border-gray-100'
                                        }`}
                                    style={{ borderRadius: '12px' }}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Header with Refined Typography */}
                    <div className="flex justify-between items-end px-5 mb-4 mt-2">
                        <h2 className="text-[11px] font-extrabold text-[#a1bebe] uppercase tracking-[0.15em]">
                            {statusFilter === 'All' ? 'ALL EQUBS' : statusFilter === 'Active' ? 'ACTIVE EQUBS' : 'COMPLETED EQUBS'}
                        </h2>
                        <span className="text-xs font-bold text-[#008080] bg-[#008080]/10 px-2 py-0.5 rounded-md">
                            {filteredEqubs.length} {filteredEqubs.length === 1 ? 'Equb' : 'Equbs'}
                        </span>
                    </div>

                    {/* Content States */}
                    {isLoading && (
                        <div className="text-center py-12">
                            <p className="text-[#608a8a] animate-pulse">Loading your equbs...</p>
                        </div>
                    )}

                    {!isLoading && (
                        <div className="px-4 space-y-4">
                            {filteredEqubs.length > 0 ? (
                                filteredEqubs.map(equb => (
                                    <EqubCard
                                        key={equb.id}
                                        id={equb.id}
                                        name={equb.name}
                                        status={equb.status}
                                        type={equb.type}
                                        currentRound={equb.currentRound}
                                        totalRounds={equb.periods?.length || equb.totalRounds || 12}
                                        progress={calculateProgress(equb)}
                                        onClick={() => history.push(`/equbs/${equb.id}`)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-[#608a8a]">No equbs found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* FLOATING ACTION BUTTON - Squircle design */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="fixed right-6 w-14 h-14 bg-[#008080] !rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,128,128,0.5)] flex items-center justify-center hover:bg-[#006666] active:scale-90 transition-all z-40"
                        style={{ borderRadius: '16px', bottom: 'calc(110px + env(safe-area-inset-bottom))' }}
                    >
                        <IonIcon icon={add} className="text-3xl text-white" />
                    </button>
                </div>
            </IonContent>

            <BottomNav />

            <CreateEqubModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchEqubs}
            />
        </IonPage>
    );
};

// ... Sample data remains same

export default MyEqubs;