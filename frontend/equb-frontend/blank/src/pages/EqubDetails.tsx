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
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
    const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const fetchEqubDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await equbApi.getOne(id);
            setEqub(data);
            setError(null);
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Failed to load equb details');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const fetchAttendance = useCallback(async (equbId: string, round: number) => {
        if (!equb?.periods) return;
        const period = equb.periods.find(p => p.sequence === round);
        if (!period) return;

        try {
            console.log(`Fetching attendance for equb: ${equbId}, round: ${round}, period: ${period.id}`);
            const attendance = await equbApi.getAttendance(equbId, round, 1000);
            console.log('Attendance fetched:', attendance);
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
        if (equb) {
            setSelectedWeek(equb.currentRound);
        }
    }, [equb]);

    useEffect(() => {
        if (equb && selectedWeek) {
            fetchAttendance(equb.id, selectedWeek);
        }
    }, [selectedWeek, equb, fetchAttendance]);

    // Calculate overall cycle progress (Settled Rounds / Total Rounds)
    const calculateProgress = () => {
        if (!equb || !equb.periods || equb.periods.length === 0) return 0;

        if (equb.status === 'COMPLETED') return 100;

        const totalPeriods = equb.periods.length;
        const settledRounds = equb.currentRound - 1;

        return Math.min(Math.round((settledRounds / totalPeriods) * 100), 100);
    };

    // Get winner for current round
    const getCurrentWinner = () => {
        // Pulse shows the winner of the round being settled or most recently settled
        // If current round is not yet settled, we look at the round that just ended (currentRound - 1)
        const roundToChecking = equb?.status === 'COMPLETED' ? equb.currentRound : (equb?.currentRound || 1) - 1;

        if (roundToChecking < 1 && equb?.status !== 'COMPLETED') return 'Not Assigned';

        const period = equb?.periods?.find(p => p.sequence === roundToChecking);
        const winnerPayout = period?.payouts?.[0];

        if (winnerPayout) {
            return winnerPayout.member?.user?.name || 'Winner Picked';
        }

        return 'Not Assigned';
    };

    const togglePayment = async (memberId: string) => {
        if (!equb || !equb.periods) return;

        const period = equb.periods.find(p => p.sequence === selectedWeek);
        if (!period) return;

        const isCurrentlyPaid = paidMemberIds.includes(memberId);

        // Optimistic update
        setPaidMemberIds(prev =>
            isCurrentlyPaid
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );

        try {
            const status = isCurrentlyPaid ? 'MISSED' : 'PAID';
            console.log(`Updating attendance for member: ${memberId}, period: ${period.id}, status: ${status}`);
            const result = await equbApi.createAttendance({
                equbMemberId: memberId,
                periodId: period.id,
                status: status
            });
            console.log('Attendance update successful:', result);
        } catch (err) {
            console.error('Failed to update attendance:', err);
            // Revert on error
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

            const multiplier = member.contributionType === 'FULL' ? 1.0 :
                member.contributionType === 'HALF' ? 0.5 :
                    member.contributionType === 'QUARTER' ? 0.25 : 1.0;
            return acc + (equb.defaultContributionAmount * multiplier);
        }, 0);
    };

    const handleFinalizeWeek = () => {
        console.log('Finalizing week:', selectedWeek, 'Paid members:', paidMemberIds);
        setActiveTab('Payouts');
    };

    const handleAssignWinner = (memberId: string) => {
        console.log('Winner assigned:', memberId);
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

    const progress = calculateProgress();

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-[#f5f8f8] min-h-screen text-[#111818] font-sans pb-24">
                    {/* Sticky Top Bar */}
                    <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
                        <div className="grid grid-cols-[40px_1fr_40px] items-center p-3 h-14">
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
                                    className="flex w-9 h-9 items-center justify-center cursor-pointer bg-equb-primary text-white rounded-full hover:shadow-lg transition-all active:scale-95"
                                >
                                    <IonIcon icon={personAdd} className="text-base" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <main className="max-w-md mx-auto">
                        {/* The Pulse Section */}
                        <section className="bg-white p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between pb-2">
                                <h3 className="text-equb-text-dark text-xl font-bold tracking-tight">The Pulse</h3>
                                <span className="px-2 py-1 bg-equb-primary/20 text-equb-primary text-[10px] font-bold rounded uppercase tracking-widest">
                                    Live Audit
                                </span>
                            </div>
                            {/* Collection Progress */}
                            <div className="flex flex-col gap-3 py-4 bg-[#f8fafb] rounded-2xl px-5 mt-2 border border-blue-50/50">
                                <div className="flex gap-6 justify-between items-end">
                                    <div>
                                        <p className="text-equb-text-dark text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Overall Progress</p>
                                        <p className="text-equb-text-gray text-xs font-medium">
                                            Round {equb.currentRound} of {equb.periods?.length || 12}
                                        </p>
                                    </div>
                                    <p className="text-equb-text-dark text-2xl font-black leading-none">{progress}%</p>
                                </div>
                                <div className="rounded-full bg-gray-200/50 h-2.5 overflow-hidden border border-gray-100">
                                    <div
                                        className="h-full bg-equb-primary transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,128,128,0.3)]"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center gap-2 mt-1 bg-white self-start px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                    <IonIcon icon={trophy} className="text-equb-primary text-xs" />
                                    <p className="text-equb-text-dark text-[10px] font-bold uppercase tracking-tight">
                                        Winner: <span className="text-equb-primary ml-1">{getCurrentWinner()}</span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Segmented Navigation */}
                        <div className="sticky top-[73px] z-40 bg-white py-5 px-4 shadow-sm border-b border-gray-100">
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
                                {/* Sub-Navigation (Week/Summary) */}
                                <div className="px-6 pt-6 pb-2">
                                    <div className="grid grid-cols-2 gap-5 p-1 relative">
                                        <button
                                            onClick={() => setIsWeekSelectorOpen(!isWeekSelectorOpen)}
                                            className="flex items-center justify-center gap-2 !rounded-full h-12 px-4 text-sm font-black transition-all bg-[#F4F5F8] text-[#608A8A] border border-gray-100/50 shadow-sm active:scale-95"
                                        >
                                            <span>Week {selectedWeek}</span>
                                            <IonIcon icon={chevronDown} className={`text-base transition-transform ${isWeekSelectorOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => setIsSummaryModalOpen(true)}
                                            className="flex items-center justify-center !rounded-full h-12 px-4 text-sm font-black transition-all bg-[#F4F5F8] text-[#608A8A] border border-gray-100/50 shadow-sm active:scale-95"
                                        >
                                            <span>Summary</span>
                                        </button>

                                        {/* Week Dropdown */}
                                        {isWeekSelectorOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                                <div className="max-h-60 overflow-y-auto">
                                                    {equb.periods && equb.periods.length > 0 ? (
                                                        equb.periods
                                                            .sort((a, b) => a.sequence - b.sequence)
                                                            .map((period) => (
                                                                <button
                                                                    key={period.id}
                                                                    onClick={() => {
                                                                        setSelectedWeek(period.sequence);
                                                                        setIsWeekSelectorOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${selectedWeek === period.sequence ? 'text-[#007f80] bg-teal-50' : 'text-[#111818]'
                                                                        }`}
                                                                >
                                                                    <span>Week {period.sequence}</span>
                                                                    {selectedWeek === period.sequence && (
                                                                        <IonIcon icon={checkmarkCircle} className="text-[#007f80]" />
                                                                    )}
                                                                </button>
                                                            ))
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-500 text-sm">No periods found</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Member Filters */}
                                    <div className="mt-6 mb-2 flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                        {(['All', 'Paid', 'Unpaid'] as const).map((filter) => {
                                            const total = equb.members?.length || 0;
                                            const paid = paidMemberIds.length;
                                            const unpaid = total - paid;
                                            const count = filter === 'All' ? total : filter === 'Paid' ? paid : unpaid;

                                            return (
                                                <button
                                                    key={filter}
                                                    onClick={() => setAttendanceFilter(filter)}
                                                    className={`flex items-center justify-center !rounded-full h-12 px-7 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${attendanceFilter === filter
                                                        ? 'bg-equb-primary text-white shadow-lg'
                                                        : 'bg-white border border-gray-100 text-[#608A8A]'
                                                        }`}
                                                >
                                                    {filter} ({count})
                                                </button>
                                            );
                                        })}
                                    </div>
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
                                    {equb.members && equb.members.length > 0 ? (
                                        equb.members
                                            .filter(member => {
                                                const matchesSearch = member.user.name.toLowerCase().includes(searchQuery.toLowerCase());
                                                const isPaid = paidMemberIds.includes(member.id);

                                                if (attendanceFilter === 'Paid') return matchesSearch && isPaid;
                                                if (attendanceFilter === 'Unpaid') return matchesSearch && !isPaid;
                                                return matchesSearch;
                                            })
                                            .map((member) => (
                                                <AttendanceListItem
                                                    key={member.id}
                                                    member={{
                                                        ...member,
                                                        shareType: member.contributionType,
                                                        amount: equb.defaultContributionAmount * (
                                                            member.contributionType === 'FULL' ? 1.0 :
                                                                member.contributionType === 'HALF' ? 0.5 :
                                                                    member.contributionType === 'QUARTER' ? 0.25 : 1.0
                                                        )
                                                    }}
                                                    isPaid={paidMemberIds.includes(member.id)}
                                                    onTogglePayment={togglePayment}
                                                />
                                            ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                            <IonIcon icon={personAdd} className="text-5xl mb-4" />
                                            <p className="font-bold">No members in this group</p>
                                        </div>
                                    )}
                                </div>

                                <AttendanceSummary
                                    totalCollected={calculateTotalCollected()}
                                    onFinalize={handleFinalizeWeek}
                                />
                            </>
                        )}

                        {activeTab === 'Payouts' && <PayoutsView equb={equb} />}

                        {activeTab === 'Insights' && <InsightsView equbId={id} />}
                    </main>

                    {/* Sticky Bottom CTA - Payout flow (moved from previous version) */}
                    {activeTab === 'Payouts' && (
                        <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-transparent flex justify-center z-40 pointer-events-none">
                            <button
                                onClick={() => setIsAssignWinnerModalOpen(true)}
                                className="w-full max-w-md bg-equb-primary hover:bg-equb-primary-dark text-white font-bold py-5 rounded-3xl shadow-[0_12px_40px_rgba(0,127,128,0.4)] transition-all active:scale-[0.95] flex items-center justify-center gap-4 pointer-events-auto"
                            >
                                <IonIcon icon={statsChart} style={{ fontSize: '24px' }} />
                                <span className="text-xl tracking-tight">Settle Round {equb.currentRound}</span>
                            </button>
                        </div>
                    )}
                </div>
            </IonContent>
            <BottomNav />

            {/* Add Members Modal */}
            <AddMembersModal
                isOpen={isAddMembersModalOpen}
                onClose={() => setIsAddMembersModalOpen(false)}
                equbId={id}
                equbName={equb?.name || ''}
                existingMemberUserIds={equb?.members?.map(m => m.user.id) || []}
                onMembersAdded={() => {
                    fetchEqubDetails();
                    fetchAttendance(id, selectedWeek);
                }}
            />

            {/* Summary Modal */}
            {
                isSummaryModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-[#111818] mb-1">Week {selectedWeek} Summary</h3>
                                <p className="text-[#608a8a] text-sm mb-6">Financial breakdown for this round</p>

                                <div className="space-y-4">
                                    <div className="bg-[#f5f8f8] p-4 rounded-xl flex justify-between items-center">
                                        <span className="text-equb-text-gray font-medium">Total Expected</span>
                                        <span className="text-equb-text-dark font-bold">
                                            {(equb.members?.length || 0) * equb.defaultContributionAmount} ETB
                                        </span>
                                    </div>
                                    <div className="bg-equb-primary/10 p-4 rounded-xl flex justify-between items-center border border-equb-primary/20">
                                        <span className="text-equb-primary font-medium">Total Collected</span>
                                        <span className="text-equb-primary font-bold">
                                            {calculateTotalCollected()} ETB
                                        </span>
                                    </div>
                                    <div className="bg-[#eb445a]/10 p-4 rounded-xl flex justify-between items-center border border-[#eb445a]/20">
                                        <span className="text-[#eb445a] font-medium">Unpaid Amount</span>
                                        <span className="text-[#eb445a] font-bold">
                                            {((equb.members?.length || 0) * equb.defaultContributionAmount) - calculateTotalCollected()} ETB
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-white border-t border-gray-100">
                                <button
                                    onClick={() => setIsSummaryModalOpen(false)}
                                    className="w-full h-12 bg-equb-primary text-white rounded-full font-black text-sm shadow-lg hover:bg-equb-primary-dark active:scale-[0.98] transition-all flex items-center justify-center"
                                >
                                    Dismiss Summary
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Assign Winner Modal */}
            <AssignWinnerModal
                isOpen={isAssignWinnerModalOpen}
                onClose={() => setIsAssignWinnerModalOpen(false)}
                onSuccess={handleAssignWinner}
                equbId={equb?.id || ''}
                periodId={equb?.periods?.find(p => p.sequence === (equb?.currentRound || 1))?.id || ''}
                currentRound={equb?.currentRound || 1}
                members={equb?.members || []}
            />
        </IonPage >
    );
};

// Helper component for mock member rows
export default EqubDetails;
