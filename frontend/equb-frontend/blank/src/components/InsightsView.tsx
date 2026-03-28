import { IonIcon, IonSpinner } from '@ionic/react';
import { trendingUp, time, people, cash, pieChart, addOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { reportingApi, EqubStats } from '../services/reportingApi';
import { equbApi } from '../services/equbApi';

interface InsightsViewProps {
    equbId: string;
}

const InsightsView: React.FC<InsightsViewProps> = ({ equbId }) => {
    const [stats, setStats] = useState<EqubStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExtending, setIsExtending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const data = await reportingApi.getEqubStats(equbId);
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch insights:', err);
            setError('Failed to load insights');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExtend = async () => {
        if (!stats || isExtending) return;

        const extensionAmount = stats.equbType === 'DAILY' ? 30 : stats.equbType === 'WEEKLY' ? 12 : 6;
        const newTotal = stats.activePeriods + extensionAmount;

        try {
            setIsExtending(true);
            await equbApi.update(equbId, { totalRounds: newTotal });
            await fetchStats();
        } catch (err) {
            console.error('Failed to extend equb:', err);
        } finally {
            setIsExtending(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [equbId]);

    if (isLoading && !stats) {
        return (
            <div className="flex justify-center items-center py-20">
                <IonSpinner name="crescent" className="text-equb-primary" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="text-center py-12 text-[#608a8a]">
                <p>{error || 'No data available'}</p>
            </div>
        );
    }

    const isDaily = stats.equbType === 'DAILY';
    const progressWidth = isDaily
        ? Math.round(((stats.recordedPeriodsCount || 0) / (stats.activePeriods || 1)) * 100)
        : stats.completionPercentage;

    return (
        <div className="pb-24 pt-6 px-4 space-y-6">
            {/* Completion Card */}
            <div className="bg-gradient-to-br from-[#008080] to-[#006666] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-white/80 font-medium">
                            {isDaily ? 'Daily Performance' : 'Overall Progress'}
                        </p>
                        <button
                            onClick={handleExtend}
                            disabled={isExtending}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isExtending ? <IonSpinner name="dots" className="w-4 h-4" /> : <IonIcon icon={addOutline} />}
                            Extend
                        </button>
                    </div>
                    <div className="flex items-end gap-2 mb-4">
                        <h1 className="text-4xl font-black">
                            {isDaily ? stats.recordedPeriodsCount : `${stats.completionPercentage}%`}
                        </h1>
                        <span className="text-white/80 mb-1.5 font-medium">
                            {isDaily ? 'Days Recorded' : 'Completed'}
                        </span>
                    </div>

                    <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressWidth}%` }}
                        />
                    </div>
                    {isDaily && (
                        <p className="mt-3 text-[10px] text-white/60 font-black uppercase tracking-widest">
                            Goal: {stats.activePeriods} Days
                        </p>
                    )}
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <IonIcon icon={cash} className="text-blue-500 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Collected</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                        {stats.totalContributions?.toLocaleString() || 0} <span className="text-xs font-normal text-gray-400">ETB</span>
                    </p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                        <IonIcon icon={trendingUp} className="text-purple-500 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Payouts</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                        {stats.totalPayouts?.toLocaleString() || 0} <span className="text-xs font-normal text-gray-400">ETB</span>
                    </p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-3">
                        <IonIcon icon={people} className="text-teal-500 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Avg Attendance</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                        {Math.round(stats.averageAttendance || 0)}%
                    </p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                        <IonIcon icon={time} className="text-orange-500 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active Rounds</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                        {stats.activePeriods || 0}
                    </p>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <IonIcon icon={pieChart} className="text-teal-600" />
                    <h3 className="font-bold text-gray-900">Member Participation</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Perfect Attendance</span>
                            <span className="font-bold text-gray-900">{stats.averageAttendance > 90 ? 'High' : 'Average'}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-teal-500 rounded-full"
                                style={{ width: `${stats.averageAttendance}%` }}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-black text-gray-900">{stats.totalMembers}</p>
                            <p className="text-xs text-gray-500">Total Members</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{(stats.totalContributions / (stats.totalMembers || 1)).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Avg / Member</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightsView;
