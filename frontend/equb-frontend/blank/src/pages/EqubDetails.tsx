import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { arrowBack, trophy, search, statsChart, personAdd } from 'ionicons/icons';
import { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Equb, ApiError } from '../types/equb.types';
import { equbApi } from '../services/equbApi';
import BottomNav from '../components/BottomNav';
import PayoutsView from '../components/PayoutsView';
import AssignWinnerModal from '../components/AssignWinnerModal';
import AttendanceListItem from '../components/AttendanceListItem';
import AttendanceSummary from '../components/AttendanceSummary';
import { chevronDown, checkmarkCircle } from 'ionicons/icons';
import AddMembersModal from '../components/AddMembersModal';
import InsightsView from '../components/InsightsView';
import PeriodScroller from '../components/PeriodScroller';

type TabType = 'Attendance' | 'Payouts' | 'Insights';

const EqubDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [equb, setEqub] = useState<Equb | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('Attendance');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssignWinnerModalOpen, setIsAssignWinnerModalOpen] = useState(false);
    const [paidMemberIds, setPaidMemberIds] = useState<string[]>([]);
    const [attendanceFilter, setAttendanceFilter] = useState<'All' | 'Unpaid' | 'Paid'>('All');

    const [selectedWeek, setSelectedWeek] = useState(1);
    const [initialSelectionMade, setInitialSelectionMade] = useState(false);
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
    const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const fetchEqubDetails = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const data = await equbApi.getOne(id);
            setEqub(data);
            setError(null);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Failed to load equb details');
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [id]);

    const fetchAttendance = useCallback(async (equbId: string, round: number) => {
        if (!equb?.periods) return;
        const period = equb.periods.find(p => p.sequence === round);
        if (!period) return;

        try {
            const attendance = await equbApi.getAttendance(equbId, period.id, 1000);
            const paidIds = attendance
                .filter(a => a.status === 'PAID' && a.equbMember)
                .map(a => a.equbMember!.id);
            setPaidMemberIds(paidIds);
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        }
    }, [equb]);

    useEffect(() => {
        fetchEqubDetails();
    }, [fetchEqubDetails]);

    useEffect(() => {
        if (equb && !initialSelectionMade) {
            const today = new Date().toDateString();
            const todayPeriod = equb.periods?.find(p => new Date(p.startDate).toDateString() === today);

            if (todayPeriod) {
                setSelectedWeek(todayPeriod.sequence);
            } else {
                setSelectedWeek(equb.currentRound);
            }
            setInitialSelectionMade(true);
        }
    }, [equb, initialSelectionMade]);

    useEffect(() => {
        if (equb && selectedWeek) {
            fetchAttendance(equb.id, selectedWeek);
        }
    }, [selectedWeek, equb, fetchAttendance]);

    const calculateProgress = () => {
        if (!equb) return 0;
        if (equb.type === 'DAILY') return 100;
        if (!equb.periods || equb.periods.length === 0) return 0;

        if (equb.status === 'COMPLETED') return 100;
        const totalPeriods = equb.periods.length;
        const settledRounds = equb.currentRound - 1;

        return Math.min(Math.round((settledRounds / totalPeriods) * 100), 100);
    };

    const getCurrentWinner = () => {
        const roundToChecking = equb?.status === 'COMPLETED' ? equb.currentRound : (equb?.currentRound || 1) - 1;
        if (roundToChecking < 1 && equb?.status !== 'COMPLETED') return 'Not Assigned';

        const period = equb?.periods?.find(p => p.sequence === roundToChecking);
        const winnerPayout = period?.payouts?.[0];

        if (winnerPayout) {
            return winnerPayout.member?.user?.name || 'Winner Picked';
        }

        return 'Not Assigned';
    };

    const handleStartEqub = async () => {
        try {
            setIsLoading(true);
            const today = new Date().toISOString().split('T')[0];
            await equbApi.start(id, today);
            await fetchEqubDetails();
        } catch (err) {
            console.error('Failed to start equb:', err);
            setError('Failed to start equb');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePayment = async (memberId: string) => {
        if (!equb || !equb.periods) return;
        if (equb.status === 'PENDING') {
            setError('Cannot record attendance for a pending Equb. Please start it first.');
            return;
        }

        const period = equb.periods.find(p => p.sequence === selectedWeek);
        if (!period) return;

        const isCurrentlyPaid = paidMemberIds.includes(memberId);

        setPaidMemberIds(prev =>
            isCurrentlyPaid
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );

        try {
            const status = isCurrentlyPaid ? 'MISSED' : 'PAID';
            await equbApi.updateAttendance({
                equbMemberId: memberId,
                periodId: period.id,
                status: status
            });
            await fetchEqubDetails(true);
        } catch (err) {
            console.error('Failed to update attendance:', err);
            setPaidMemberIds(prev =>
                isCurrentlyPaid
                    ? [...prev, memberId]
                    : prev.filter(id => id !== memberId)
            );
        }
    };

    const calculateTotalCollected = () => {
        if (!equb?.members) return 0;
        return equb.members.reduce((acc, member) => {
            const isPaid = paidMemberIds.includes(member.id);
            if (!isPaid) return acc;

            if (member.contributionType === 'CUSTOM') {
                return acc + Number(member.customContributionAmount || 0);
            }

            const multiplier = member.contributionType === 'FULL' ? 1.0 :
                member.contributionType === 'HALF' ? 0.5 :
                    member.contributionType === 'QUARTER' ? 0.25 : 1.0;
            return acc + (equb.defaultContributionAmount * multiplier);
        }, 0);
    };

    const handleFinalizeWeek = () => {
        setActiveTab('Payouts');
    };

    const handleAssignWinner = (memberId: string) => {
        fetchEqubDetails();
    };

    if (isLoading) {
        return (
            <IonPage>
                <IonContent>
                    <div className="flex items-center justify-center h-screen bg-[#f5f8f8]">
                        <p className="text-[#608a8a]">Loading equb details...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (error || !equb) {
        return (
            <IonPage>
                <IonContent>
                    <div className="flex flex-col items-center justify-center h-screen p-4 bg-[#f5f8f8]">
                        <p className="text-red-600 mb-4">{error || 'Equb not found'}</p>
                        <button
                            onClick={() => history.push('/dashboard')}
                            className="px-4 py-2 bg-equb-primary text-white rounded-xl"
                        >
                            Back to Equbs
                        </button>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-[#f5f8f8] min-h-screen text-[#111818] font-sans pb-24">
                    {/* Sticky Top Bar */}
                    <div className="sticky top-0 z-50 bg-white border-b border-gray-100" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                        <div className="grid grid-cols-[40px_1fr_40px] items-center px-3 py-2 h-16">
                            <button
                                onClick={() => history.goBack()}
                                className="flex w-9 h-9 items-center justify-center cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <IonIcon icon={arrowBack} className="text-[#111818] text-xl" />
                            </button>
                            <h1 className="!text-[10px] font-black text-equb-text-dark uppercase tracking-widest text-center px-1 leading-tight flex-1">
                                Equb Operational Detail
                            </h1>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsAddMembersModalOpen(true)}
                                    className="flex w-9 h-9 items-center justify-center cursor-pointer bg-equb-primary text-white !rounded-xl shadow-[0_4px_12px_-2px_rgba(0,128,128,0.4)] hover:shadow-lg transition-all active:scale-90"
                                    style={{ borderRadius: '10px' }}
                                >
                                    <IonIcon icon={personAdd} className="text-base" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <main className="max-w-md mx-auto">
                        {/* The Pulse Section */}
                        <section className="bg-white p-4 border-b border-gray-100">
                            <h3 className="text-equb-text-dark text-xl font-bold tracking-tight pb-2">The Pulse</h3>
                            <div className="flex flex-col gap-3 py-4 bg-[#f8fafb] rounded-2xl px-5 mt-2 border border-blue-50/50">
                                <div className="flex gap-6 justify-between items-end">
                                    <div>
                                        <p className="text-equb-text-dark text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Overall Progress</p>
                                        <p className="text-equb-text-gray text-xs font-medium">
                                            {equb.type === 'DAILY'
                                                ? `Day ${Math.floor((new Date().getTime() - new Date(equb.startDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) + 1} of ${equb.totalRounds}`
                                                : `Round ${equb.currentRound} of ${equb.periods?.length || 0}`}
                                        </p>
                                    </div>
                                    <div className="relative w-20 h-20">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="40" cy="40" r="36" fill="transparent" stroke="#dae7e7" strokeWidth="6" />
                                            <circle
                                                className="transition-all duration-1000 ease-out"
                                                cx="40" cy="40" fill="transparent" r="36"
                                                stroke={equb.type === 'DAILY' ? "#0bdada" : "#008080"}
                                                strokeWidth="6"
                                                strokeDasharray={2 * Math.PI * 36}
                                                strokeDashoffset={2 * Math.PI * 36 - (calculateProgress() / 100) * (2 * Math.PI * 36)}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`${equb.type === 'DAILY' ? 'text-4xl' : 'text-xl'} font-black text-[#111818]`}>
                                                {equb.type === 'DAILY' ? '∞' : `${calculateProgress()}%`}
                                            </span>
                                            {equb.type !== 'DAILY' && (
                                                <span className="text-[8px] font-bold text-[#608a8a] mt-0.5 uppercase tracking-widest">Progress</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {equb.status === 'PENDING' ? (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <p className="text-amber-600 text-[10px] font-bold uppercase">Ready to start?</p>
                                        <button
                                            onClick={handleStartEqub}
                                            className="w-full bg-equb-primary text-white py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all"
                                        >
                                            Start Equb Now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mt-1 bg-white self-start px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                        <IonIcon icon={trophy} className="text-equb-primary text-xs" />
                                        <p className="text-equb-text-dark text-[10px] font-bold uppercase tracking-tight">
                                            Winner: <span className="text-equb-primary ml-1">{getCurrentWinner()}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Segmented Navigation */}
                        <div className="sticky top-[73px] z-40 bg-white py-5 px-4 shadow-sm border-b border-gray-100" style={{ top: 'calc(4rem + env(safe-area-inset-top))' }}>
                            <div className="grid grid-cols-3 gap-5 p-1">
                                {(['Attendance', 'Payouts', 'Insights'] as TabType[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center justify-center !rounded-full h-12 px-2 text-sm font-black transition-all whitespace-nowrap overflow-hidden text-ellipsis ${activeTab === tab
                                            ? 'bg-equb-primary text-white shadow-lg scale-[1.02]'
                                            : 'bg-[#F4F5F8] text-equb-text-gray hover:bg-gray-200 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        {activeTab === 'Attendance' && (
                            <>
                                <div className="bg-white border-b border-gray-50 pb-2">
                                    <div className="flex items-center justify-between px-6 pt-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#111818]/60">Select {equb.type === 'DAILY' ? 'Day' : 'Round'}</h4>
                                        <button
                                            onClick={() => setIsSummaryModalOpen(true)}
                                            className="text-equb-primary text-[10px] font-black uppercase tracking-widest"
                                        >
                                            View Summary
                                        </button>
                                    </div>
                                    <PeriodScroller
                                        periods={equb.periods || []}
                                        selectedSequence={selectedWeek}
                                        onSelect={(p) => setSelectedWeek(p.sequence)}
                                        type={equb.type}
                                    />
                                </div>

                                {/* Member Filters */}
                                <div className="mt-6 px-6 mb-2 flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {(['All', 'Paid', 'Unpaid'] as const).map((filter) => {
                                        const count = filter === 'All' ? (equb.members?.length || 0) : filter === 'Paid' ? paidMemberIds.length : (equb.members?.length || 0) - paidMemberIds.length;
                                        return (
                                            <button
                                                key={filter}
                                                onClick={() => setAttendanceFilter(filter)}
                                                className={`flex items-center justify-center !rounded-full h-12 px-7 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${attendanceFilter === filter ? 'bg-equb-primary text-white shadow-lg' : 'bg-white border border-gray-100 text-[#608A8A]'}`}
                                            >
                                                {filter} ({count})
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search Bar */}
                                <div className="px-6 pb-6 mt-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <IonIcon icon={search} className="text-[#a1bebe] text-xl" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-base focus:ring-2 focus:ring-[#007f80]/10 placeholder-gray-400 text-[#111818] transition-all"
                                            placeholder="Search members by name..."
                                        />
                                    </div>
                                </div>

                                {/* Members List */}
                                <div className="space-y-0 border-t border-gray-100 mb-40">
                                    {equb.members?.filter(member => {
                                        const matchesSearch = member.user.name.toLowerCase().includes(searchQuery.toLowerCase());
                                        const isPaid = paidMemberIds.includes(member.id);
                                        if (attendanceFilter === 'Paid') return matchesSearch && isPaid;
                                        if (attendanceFilter === 'Unpaid') return matchesSearch && !isPaid;
                                        return matchesSearch;
                                    }).map((member) => (
                                        <AttendanceListItem
                                            key={member.id}
                                            member={{
                                                ...member,
                                                shareType: member.contributionType,
                                                amount: member.contributionType === 'CUSTOM' ? (member.customContributionAmount || 0) : equb.defaultContributionAmount * (member.contributionType === 'FULL' ? 1.0 : member.contributionType === 'HALF' ? 0.5 : 0.25),
                                                contributionDays: member.contributionDays
                                            }}
                                            isPaid={paidMemberIds.includes(member.id)}
                                            onTogglePayment={togglePayment}
                                        />
                                    )) || (
                                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                                <IonIcon icon={personAdd} className="text-5xl mb-4" />
                                                <p className="font-bold">No members in this group</p>
                                            </div>
                                        )}
                                </div>

                                <AttendanceSummary
                                    totalCollected={calculateTotalCollected()}
                                    onFinalize={handleFinalizeWeek}
                                    finalizeLabel={
                                        equb.type === 'DAILY' ? 'Finalize Day' :
                                            equb.type === 'WEEKLY' ? 'Finalize Week' :
                                                'Finalize Month'
                                    }
                                />
                            </>
                        )}

                        {activeTab === 'Payouts' && <PayoutsView equb={equb} />}
                        {activeTab === 'Insights' && <InsightsView equbId={id} />}
                    </main>
                </div>
            </IonContent>

            <BottomNav />

            {activeTab === 'Payouts' && (
                <div className="fixed left-0 right-0 p-4 bg-transparent flex justify-center z-40 pointer-events-none" style={{ bottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
                    <button
                        onClick={() => setIsAssignWinnerModalOpen(true)}
                        disabled={equb.status !== 'ACTIVE'}
                        className={`w-full max-w-md ${equb.status === 'ACTIVE' ? 'bg-equb-primary hover:bg-equb-primary-dark shadow-[0_12px_40px_rgba(0,127,128,0.4)]' : 'bg-gray-300 cursor-not-allowed'} text-white font-bold py-5 rounded-3xl transition-all active:scale-[0.95] flex items-center justify-center gap-4 pointer-events-auto`}
                    >
                        <IonIcon icon={statsChart} style={{ fontSize: '24px' }} />
                        <span className="text-xl tracking-tight">
                            {equb.status === 'PENDING' ? 'Start Equb First' : equb.status === 'COMPLETED' ? 'Equb Completed' : `Settle Round ${equb.currentRound}`}
                        </span>
                    </button>
                </div>
            )}

            <AddMembersModal
                isOpen={isAddMembersModalOpen}
                onClose={() => setIsAddMembersModalOpen(false)}
                equbId={id}
                equbName={equb?.name || ''}
                existingMemberUserIds={equb?.members?.map(m => m.user.id) || []}
                onMembersAdded={() => fetchEqubDetails()}
            />

            {isSummaryModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-[#111818] mb-1">Week {selectedWeek} Summary</h3>
                            <p className="text-[#608a8a] text-sm mb-6">Financial breakdown for this round</p>
                            <div className="space-y-4">
                                <div className="bg-[#f5f8f8] p-4 rounded-xl flex justify-between items-center">
                                    <span className="text-equb-text-gray font-medium">Total Expected</span>
                                    <p className="text-xl font-bold text-[#111818]">
                                        {(equb.members?.reduce((sum, m) => sum + (m.contributionType === 'CUSTOM' ? (Number(m.customContributionAmount) || 0) : equb.defaultContributionAmount * (m.contributionType === 'FULL' ? 1.0 : m.contributionType === 'HALF' ? 0.5 : 0.25)), 0) || 0).toLocaleString()} ETB
                                    </p>
                                </div>
                                <div className="bg-equb-primary/10 p-4 rounded-xl flex justify-between items-center border border-equb-primary/20">
                                    <span className="text-equb-primary font-medium">Total Collected</span>
                                    <span className="text-equb-primary font-bold">{calculateTotalCollected()} ETB</span>
                                </div>
                                <div className="bg-[#eb445a]/10 p-4 rounded-xl flex justify-between items-center border border-[#eb445a]/20">
                                    <span className="text-[#eb445a] font-medium">Unpaid Amount</span>
                                    <p className="text-xl font-bold text-red-600">
                                        {((equb.members?.reduce((sum, m) => sum + (m.contributionType === 'CUSTOM' ? (Number(m.customContributionAmount) || 0) : equb.defaultContributionAmount * (m.contributionType === 'FULL' ? 1.0 : m.contributionType === 'HALF' ? 0.5 : 0.25)), 0) || 0) - calculateTotalCollected()).toLocaleString()} ETB
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white border-t border-gray-100">
                            <button onClick={() => setIsSummaryModalOpen(false)} className="w-full h-12 bg-equb-primary text-white rounded-full font-black text-sm shadow-lg hover:bg-equb-primary-dark active:scale-[0.98] transition-all flex items-center justify-center">Dismiss Summary</button>
                        </div>
                    </div>
                </div>
            )}

            <AssignWinnerModal
                isOpen={isAssignWinnerModalOpen}
                onClose={() => setIsAssignWinnerModalOpen(false)}
                onSuccess={handleAssignWinner}
                equbId={equb?.id || ''}
                equbType={equb.type}
                periodId={equb?.periods?.find(p => p.sequence === (equb?.currentRound || 1))?.id || ''}
                currentRound={equb?.currentRound || 1}
                members={equb?.members || []}
            />
        </IonPage>
    );
};

export default EqubDetails;
