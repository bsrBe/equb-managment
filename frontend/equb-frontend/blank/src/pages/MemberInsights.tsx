import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import { arrowBackOutline, ellipsisVertical, call } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { equbApi } from '../services/equbApi';
import { EqubMember, ApiError } from '../types/equb.types';
import { formatErrorMessage } from '../utils/errorUtils';

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
                setError(formatErrorMessage(err));
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
                    <div className="flex flex-col items-center justify-center h-screen p-6 bg-[#f5f8f8] text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <IonIcon icon={ellipsisVertical} className="text-4xl text-red-500 rotate-90" />
                        </div>
                        <h2 className="text-xl font-bold text-[#111818] mb-2">Something went wrong</h2>
                        <p className="text-[#608a8a] mb-8 max-w-[280px]">
                            {error || 'No active memberships or payment history found for this member.'}
                        </p>
                        <button
                            onClick={() => history.goBack()}
                            className="w-full max-w-[200px] h-14 bg-[#008080] text-white !rounded-2xl font-bold text-lg shadow-[0_10px_25px_-5px_rgba(0,128,128,0.4)] active:scale-[0.97] transition-all flex items-center justify-center"
                            style={{ borderRadius: '16px' }}
                        >
                            Go Back
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
                    <div className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md px-4 justify-between border-b border-[#dae7e7]" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))', paddingBottom: '1rem' }}>
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
                                <div key={membership.id} className="bg-white border border-[#dae7e7] !rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-[#101818] font-bold text-sm">{membership.equb?.name}</p>
                                        <p className="text-[#5e8d8d] text-xs mt-1">
                                            {membership.contributionType} Share • {membership.equb?.defaultContributionAmount.toLocaleString()} ETB
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${membership.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                        {membership.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Consistency Score Section */}
                    <div className="px-4 py-4">
                        <div className="bg-[#007f80]/5 !rounded-3xl p-6 flex flex-col items-center border border-[#007f80]/10 shadow-sm">
                            <h4 className="text-[#007f80] font-bold text-xs uppercase tracking-[0.2em] mb-6">Overall Consistency</h4>
                            <div className="relative flex items-center justify-center w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="text-white" cx="80" cy="80" fill="transparent" r="70" stroke="white" strokeWidth="12" />
                                    <circle className="text-[#007f80] transition-all duration-1000 ease-out" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor"
                                        strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" strokeWidth="12" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-black text-[#101818]">{consistency}%</span>
                                    <span className="text-[10px] font-black text-[#007f80] mt-1 uppercase tracking-widest">{consistency >= 90 ? 'EXCELLENT' : consistency >= 75 ? 'GOOD' : 'AVERAGE'}</span>
                                </div>
                            </div>
                            <p className="mt-6 text-center text-sm text-[#5e8d8d] px-4 font-medium leading-relaxed">
                                Reliability rating across {memberships.length} active Equb memberships.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex flex-wrap gap-4 px-4 py-2">
                        <div className="flex min-w-[140px] flex-1 flex-col gap-1 !rounded-2xl p-5 border border-[#dae7e7] bg-white shadow-sm">
                            <p className="text-[#5e8d8d] text-[10px] font-black uppercase tracking-widest">Total Saved</p>
                            <p className="text-[#101818] text-2xl font-black mt-1">ETB {(totalSaved / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="flex min-w-[140px] flex-1 flex-col gap-1 !rounded-2xl p-5 border border-[#dae7e7] bg-white shadow-sm">
                            <p className="text-[#5e8d8d] text-[10px] font-black uppercase tracking-widest">Missed Rounds</p>
                            <p className="text-red-500 text-2xl font-black mt-1">{missed}</p>
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
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-[#dae7e7] px-4 pt-4 flex flex-col gap-4" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
                        <div className="flex gap-4 items-center">
                            <a
                                href={`tel:${user.phone}`}
                                className="w-full h-14 bg-[#008080] text-white !rounded-2xl font-bold text-lg shadow-[0_10px_25px_-5px_rgba(0,128,128,0.4)] active:scale-[0.97] transition-all flex items-center justify-center gap-3"
                                style={{ borderRadius: '16px' }}
                            >
                                <IonIcon icon={call} className="text-xl" />
                                <span>Call {user.name}</span>
                            </a>

                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default MemberInsights;
