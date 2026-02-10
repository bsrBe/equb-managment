import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import SearchBar from '../components/SearchBar';
import EqubCard from '../components/EqubCard';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
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

    // Fetch equbs from API
    const fetchEqubs = async () => {
        try {
            setIsLoading(true);
            const data = await equbApi.getAll();
            setEqubs(data);
            setError(null);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Failed to load equbs');
            // Fallback to sample data if API fails
            setEqubs(getSampleEqubs());
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEqubs();
    }, []);

    const handleEqubClick = (id: string) => {
        history.push(`/equbs/${id}`);
    };

    const handleCreateSuccess = () => {
        fetchEqubs(); // Refresh the list
    };

    const filteredEqubs = equbs
        .filter(equb => equb.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(equb => {
            if (statusFilter === 'All') return true;
            if (statusFilter === 'Active') return equb.status === 'ACTIVE';
            if (statusFilter === 'Completed') return equb.status === 'COMPLETED';
            return true;
        });

    // Calculate progress percentage based on current round
    const calculateProgress = (equb: Equb) => {
        if (!equb.periods || equb.periods.length === 0) return 0;
        return Math.round((equb.currentRound / equb.periods.length) * 100);
    };



    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-equb-bg min-h-screen pb-20">
                    <Header title="My Equbs" />

                    {/* Search Bar */}
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search your Equbs"
                    />

                    {/* Status Filter Navigation */}
                    <div className="px-4 pb-2">
                        <div className="grid grid-cols-3 gap-4 p-1">
                            {(['All', 'Active', 'Completed'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`flex items-center justify-center !rounded-full min-h-[40px] px-2 text-sm font-medium transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${statusFilter === filter
                                        ? 'bg-[#008080] text-white shadow-sm'
                                        : 'bg-[#F4F5F8] text-[#608A8A] hover:bg-gray-200 hover:text-gray-700'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Header */}
                    <div className="flex justify-between items-center px-4 mb-3 mt-2">
                        <h2 className="text-sm font-semibold text-equb-text-gray uppercase tracking-wide">
                            {statusFilter === 'All' ? 'ALL EQUBS' : statusFilter === 'Active' ? 'ACTIVE EQUBS' : 'COMPLETED EQUBS'}
                        </h2>
                        <span className="text-sm font-semibold text-equb-primary">
                            {filteredEqubs.length} {filteredEqubs.length === 1 ? 'Equb' : 'Equbs'}
                        </span>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-8">
                            <p className="text-equb-text-gray">Loading equbs...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="mx-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-sm text-yellow-800">{error}</p>
                            <p className="text-xs text-yellow-600 mt-1">Showing sample data</p>
                        </div>
                    )}

                    {/* Equb Cards */}
                    {!isLoading && (
                        <div className="pb-4">
                            {filteredEqubs.length > 0 ? (
                                filteredEqubs.map(equb => (
                                    <EqubCard
                                        key={equb.id}
                                        id={equb.id}
                                        name={equb.name}
                                        currentRound={equb.currentRound}
                                        totalRounds={equb.periods?.length || 12}
                                        progress={calculateProgress(equb)}
                                        onClick={() => handleEqubClick(equb.id)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-equb-text-gray">No equbs found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Floating Action Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="fixed bottom-24 right-6 w-12 h-12 bg-equb-primary rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-90 transition-all z-40"
                    >
                        <IonIcon icon={add} className="text-2xl text-white" />
                    </button>
                </div>
            </IonContent>

            <BottomNav />

            {/* Create Equb Modal */}
            <CreateEqubModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </IonPage>
    );
};

// Sample data fallback
const getSampleEqubs = (): Equb[] => [
    {
        id: '1',
        name: 'Holiday Fund',
        type: 'MONTHLY',
        defaultContributionAmount: 500,
        startDate: '2026-01-01',
        status: 'ACTIVE',
        currentRound: 4,
        createdAt: '2026-01-01',
        periods: Array(12).fill(null).map((_, i) => ({
            id: `p${i}`,
            sequence: i + 1,
            startDate: '',
            endDate: '',
            isCompleted: i < 4,
            createdAt: '',
        })),
    },
    {
        id: '2',
        name: 'Home Down Payment',
        type: 'MONTHLY',
        defaultContributionAmount: 1000,
        startDate: '2025-10-01',
        status: 'ACTIVE',
        currentRound: 15,
        createdAt: '2025-10-01',
        periods: Array(24).fill(null).map((_, i) => ({
            id: `p${i}`,
            sequence: i + 1,
            startDate: '',
            endDate: '',
            isCompleted: i < 15,
            createdAt: '',
        })),
    },
];

export default MyEqubs;
