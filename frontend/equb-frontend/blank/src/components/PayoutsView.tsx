import { IonSpinner } from '@ionic/react';
import { useState, useEffect } from 'react';
import { equbApi } from '../services/equbApi';
import { Equb, Payout } from '../types/equb.types';

interface PayoutsViewProps {
    equb: Equb;
}

const PayoutsView: React.FC<PayoutsViewProps> = ({ equb }) => {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            if (!equb?.id) return;
            try {
                setIsLoading(true);
                const data = await equbApi.getPayouts(equb.id);
                setPayouts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayouts();
    }, [equb?.id]);

    // Calculate total pool balance
    const totalPool = equb.members?.reduce((sum: number, member) => {
        const base = Number(equb.defaultContributionAmount);
        let multiplier = 1;
        if (member.contributionType === 'HALF') multiplier = 0.5;
        if (member.contributionType === 'QUARTER') multiplier = 0.25;
        return sum + (base * multiplier);
    }, 0) || 0;

    return (
        <div className="pb-24">
            {/* Current Cycle Summary */}
            <div className="px-4 py-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-equb-text-gray font-medium mb-1">Total Pool Balance</p>
                    <h1 className="text-3xl font-bold text-primary">{totalPool.toLocaleString()} ETB</h1>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Round {equb.currentRound} of {equb.periods?.length || 0}
                        </span>
                        <span className="text-xs text-equb-text-gray">Status: {equb.status}</span>
                    </div>
                </div>
            </div>

            {/* Section Header */}
            <div className="px-4 pb-2 pt-2">
                <h3 className="text-lg font-bold text-equb-text-dark">Payout History</h3>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-8">
                    <IonSpinner name="crescent" className="text-equb-primary" />
                </div>
            )}

            {/* Payouts List */}
            {!isLoading && (
                <div className="divide-y divide-gray-50">
                    {payouts.length > 0 ? (
                        payouts.map((payout) => (
                            <div key={payout.id} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-3 justify-between active:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border border-gray-100"
                                        style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${payout.member?.user?.name})` }}
                                    />
                                    < div className="flex flex-col justify-center" >
                                        <p className="text-base font-semibold text-equb-text-dark leading-none mb-1">
                                            {payout.member?.user?.name || 'Unknown'}
                                        </p>
                                        <p className="text-sm font-normal text-equb-text-gray leading-normal">
                                            {new Date(payout.payoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div >
                                </div >
                                <div className="shrink-0 text-right">
                                    <p className="text-base font-bold text-equb-text-dark leading-normal">
                                        {Number(payout.amount).toLocaleString()} ETB
                                    </p>
                                    <p className="text-[10px] text-primary uppercase font-bold tracking-wider">PAID</p>
                                </div>
                            </div >
                        ))
                    ) : (
                        <div className="text-center py-8 bg-white">
                            <p className="text-equb-text-gray">No payouts yet</p>
                        </div>
                    )}
                </div >
            )}
        </div >
    );
};

export default PayoutsView;
