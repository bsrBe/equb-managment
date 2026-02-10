import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import BottomNav from '../components/BottomNav';
import { arrowDownCircle, arrowUpCircle, receiptOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { reportingApi, Transaction } from '../services/reportingApi';

const Ledger: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Collections' | 'Payouts'>('All');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                const data = await reportingApi.getTransactions();
                setTransactions(data);
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'All') return true;
        if (filter === 'Collections') return t.type === 'COLLECTION';
        if (filter === 'Payouts') return t.type === 'PAYOUT';
        return true;
    });

    const totalIn = transactions.filter(t => t.type === 'COLLECTION').reduce((sum, t) => sum + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'PAYOUT').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIn - totalOut;

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-[#f5f8f8] min-h-screen pb-24 font-sans text-[#111818]">
                    {/* Header */}
                    <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
                        <h1 className="text-3xl font-extrabold tracking-tight mb-6">Ledger</h1>

                        {/* Balance Card */}
                        <div className="bg-gradient-to-br from-[#008080] to-[#006666] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-6 flex flex-col items-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

                            <p className="text-white/80 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Net Balance</p>
                            <h2 className="text-4xl font-black mb-6 flex items-baseline gap-2">
                                {balance.toLocaleString()}
                                <span className="text-sm font-bold opacity-60">ETB</span>
                            </h2>

                            <div className="grid grid-cols-2 gap-8 w-full pt-6 border-t border-white/10">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1.5 text-green-200 mb-1">
                                        <IonIcon icon={arrowDownCircle} className="text-xs" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Total In</span>
                                    </div>
                                    <p className="font-black text-xl">{totalIn.toLocaleString()}</p>
                                </div>
                                <div className="flex flex-col items-center border-l border-white/10">
                                    <div className="flex items-center gap-1.5 text-red-200 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider">Total Out</span>
                                        <IonIcon icon={arrowUpCircle} className="text-xs" />
                                    </div>
                                    <p className="font-black text-xl">{totalOut.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 p-1 bg-[#f5f8f8] rounded-[2rem]">
                            {(['All', 'Collections', 'Payouts'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`h-12 px-2 !rounded-full text-sm font-black transition-all ${filter === f
                                        ? 'bg-white text-[#007f80] shadow-lg scale-[1.05] z-10'
                                        : 'text-gray-500/70 hover:text-gray-700'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="px-4 py-4 space-y-3">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <IonSpinner name="crescent" className="text-[#007f80]" />
                            </div>
                        ) : filteredTransactions.length > 0 ? (
                            filteredTransactions.map((t) => (
                                <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${t.type === 'COLLECTION' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            <IonIcon icon={t.type === 'COLLECTION' ? arrowDownCircle : arrowUpCircle} className="text-2xl" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#111818] mb-0.5">{t.memberName}</p>
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                                <span>{t.equbName}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>{new Date(t.date).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black ${t.type === 'COLLECTION' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'COLLECTION' ? '+' : '-'}{t.amount.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">{t.type}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <IonIcon icon={receiptOutline} className="text-4xl mb-3 opacity-30" />
                                <p className="font-medium">No transactions found</p>
                            </div>
                        )}
                    </div>
                </div>
            </IonContent>
            <BottomNav />
        </IonPage>
    );
};

export default Ledger;
