import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import { arrowBackOutline, ellipsisVertical, call } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { equbApi } from '../services/equbApi';
import { EqubMember, ApiError } from '../types/equb.types';

const MemberInsights: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const history = useHistory();
    const [memberships, setMemberships] = useState<EqubMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const data = await equbApi.getUserMemberships(userId);
                setMemberships(data);
                setError(null);
            } catch (err) {
                const error = err as ApiError;
                setError(error.response?.data?.message || 'Failed to load member insights');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [userId]);

    const calculateStats = () => {
        if (!memberships || memberships.length === 0) {
            return { totalSaved: 0, missed: 0, consistency: 0, totalRounds: 0 };
        }

        let totalPaid = 0;
        let totalMissed = 0;
        let totalSaved = 0;

        memberships.forEach(membership => {
            const attendances = membership.attendances || [];
            const paidAttendances = attendances.filter(a => a.status === 'PAID');
            const missedAttendances = attendances.filter(a => a.status === 'MISSED');

            totalPaid += paidAttendances.length;
            totalMissed += missedAttendances.length;
            totalSaved += paidAttendances.length * (membership.equb?.defaultContributionAmount || 0);
        });

        const totalRounds = totalPaid + totalMissed;
        const consistency = totalRounds > 0 ? Math.round((totalPaid / totalRounds) * 100) : 0;

        return { totalSaved, missed: totalMissed, consistency, totalRounds };
    };

    if (isLoading) {
        return (
            <IonPage>
                <IonContent>
                    <div className="flex items-center justify-center h-screen bg-[#f5f8f8]">
                        <IonSpinner color="primary" />
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (error || memberships.length === 0) {
        return (
            <IonPage>
                <IonContent>
                    <div className="flex flex-col items-center justify-center h-screen p-4 bg-[#f5f8f8]">
                        <p className="text-red-600 mb-4">{error || 'No memberships found for this user'}</p>
                        <button
                            onClick={() => history.goBack()}
                            className="px-4 py-2 bg-[#007f80] text-white rounded-xl"
                        >
                            Back
                        </button>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const user = memberships[0].user;
    const { totalSaved, missed, consistency } = calculateStats();
    const circumference = 2 * Math.PI * 70;
    const dashoffset = circumference - (consistency / 100) * circumference;

    // Aggregate all attendances across all memberships
    const allAttendances = memberships.flatMap(m =>
        (m.attendances || []).map(a => ({ ...a, equbName: m.equb?.name || 'Unknown Equb' }))
    ).sort((a, b) => (b.period?.sequence || 0) - (a.period?.sequence || 0));

    return (
        <IonPage>
            <IonContent fullscreen className="bg-[#f5f8f8]">
                <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-white shadow-xl overflow-x-hidden pb-32">
                    {/* Top App Bar */}
                    <div className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-[#dae7e7]">
                        <button onClick={() => history.goBack()} className="text-[#101818] flex size-12 shrink-0 items-center cursor-pointer">
                            <IonIcon icon={arrowBackOutline} className="text-xl" />
                        </button>
                        <h2 className="text-[#101818] text-lg font-bold leading-tight tracking-tight flex-1 text-center">Member Analytics</h2>
                        <div className="flex w-12 items-center justify-end">
                            <button className="flex cursor-pointer items-center justify-center rounded-lg h-12 bg-transparent text-[#101818] p-0">
                                <IonIcon icon={ellipsisVertical} className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Profile Header */}
                    <div className="flex p-4 mt-2">
                        <div className="flex w-full flex-col gap-4">
                            <div className="flex gap-4 items-center">
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-20 w-20 border-2 border-[#007f80]/20"
                                    style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${user.id})` }}>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[#101818] text-xl font-bold leading-tight">{user.name}</p>
                                    <p className="text-[#5e8d8d] text-sm font-medium">{user.phone}</p>
                                    <p className="text-[#5e8d8d] text-sm">Member of {memberships.length} Equb{memberships.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Equb Memberships */}
                    <div className="px-4 py-2">
                        <h3 className="text-[#608a8a] text-xs font-bold uppercase tracking-[0.15em] mb-3">Active Equbs</h3>
                        <div className="space-y-2">
                            {memberships.map((membership) => (
                                <div key={membership.id} className="bg-white border border-[#dae7e7] rounded-xl p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[#101818] font-bold text-sm">{membership.equb?.name}</p>
                                        <p className="text-[#5e8d8d] text-xs mt-0.5">
                                            {membership.contributionType} Share • {membership.equb?.defaultContributionAmount.toLocaleString()} ETB
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${membership.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                        {membership.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Consistency Score Section */}
                    <div className="px-4 py-4">
                        <div className="bg-[#007f80]/5 rounded-xl p-6 flex flex-col items-center border border-[#007f80]/10">
                            <h4 className="text-[#007f80] font-bold text-sm uppercase tracking-wider mb-4">Overall Consistency Score</h4>
                            <div className="relative flex items-center justify-center w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="text-gray-200" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                                    <circle className="text-[#007f80] transition-all duration-1000 ease-out" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor"
                                        strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" strokeWidth="12" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-black text-[#101818]">{consistency}%</span>
                                    <span className="text-xs font-bold text-[#5e8d8d]">{consistency >= 90 ? 'EXCELLENT' : consistency >= 75 ? 'GOOD' : 'AVERAGE'}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-center text-sm text-[#5e8d8d] px-4">
                                Across all Equbs, with {allAttendances.length} total contribution rounds.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex flex-wrap gap-3 p-4">
                        <div className="flex min-w-[130px] flex-1 flex-col gap-1 rounded-xl p-4 border border-[#dae7e7] bg-white">
                            <p className="text-[#5e8d8d] text-xs font-bold uppercase">Total Saved</p>
                            <p className="text-[#101818] text-xl font-bold">ETB {(totalSaved / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="flex min-w-[130px] flex-1 flex-col gap-1 rounded-xl p-4 border border-[#dae7e7] bg-white">
                            <p className="text-[#5e8d8d] text-xs font-bold uppercase">Missed</p>
                            <p className="text-red-500 text-xl font-bold">{missed} Round{missed !== 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    {/* Payment History Timeline */}
                    <div className="px-4 py-4 mb-4">
                        <h3 className="text-[#101818] text-lg font-bold mb-6 px-1">Payment History</h3>
                        <div className="relative ml-4 border-l-2 border-[#dae7e7] flex flex-col gap-8 pb-4">
                            {allAttendances.length > 0 ? (
                                allAttendances.map((att) => (
                                    <div key={att.id} className="relative pl-8">
                                        <div className={`absolute -left-[11px] top-0 size-5 rounded-full border-4 border-white ${att.status === 'PAID' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <div className="flex flex-col">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-[#101818]">
                                                    {att.equbName} - Round {att.period?.sequence}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${att.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {att.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[#5e8d8d]">
                                                {att.status === 'PAID'
                                                    ? `Contribution recorded on ${new Date(att.recordedAt).toLocaleDateString()}`
                                                    : 'Contribution missed for this round'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="pl-8 text-[#5e8d8d] italic">No payment history available yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Sticky Bottom Actions */}
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-[#dae7e7] p-4 pb-8 flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                            <a
                                href={`tel:${user.phone}`}
                                onClick={() => console.log('Calling:', user.phone)}
                                className="flex-1 flex items-center justify-center gap-3 h-12 bg-[#007f80] text-white rounded-xl shadow-lg shadow-[#007f80]/20 hover:opacity-90 active:scale-95 transition-all font-bold"
                            >
                                <IonIcon icon={call} className="text-xl" />
                                <span>Call {user.phone}</span>
                            </a>

                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default MemberInsights;
