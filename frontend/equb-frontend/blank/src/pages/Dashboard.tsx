import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import Header from '../components/Header';
import ProgressCard from '../components/ProgressCard';
import StatCard from '../components/StatCard';
import BottomNav from '../components/BottomNav';
import { calculator, wallet, people, person } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { reportingApi, DashboardStats } from '../services/reportingApi';
import { ApiError } from '../types/equb.types';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setIsLoading(true);
                const data = await reportingApi.getDashboard();
                setStats(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                const error = err as ApiError;
                setError(error.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    const calculateProgress = () => {
        if (!stats) return { percentage: 0, current: 0, goal: 0 };
        const percentage = stats.totalExpected > 0
            ? Math.round((stats.totalCollected / stats.totalExpected) * 100)
            : 0;
        return {
            percentage,
            current: stats.totalCollected,
            goal: stats.totalExpected,
        };
    };

    const progress = calculateProgress();

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-equb-bg min-h-screen pb-20">
                    <Header />

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <IonSpinner name="crescent" className="text-equb-primary" />
                        </div>
                    ) : error ? (
                        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    ) : stats ? (
                        <>
                            <ProgressCard
                                percentage={progress.percentage}
                                current={progress.current}
                                goal={progress.goal}
                            />

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 px-4 mb-4">
                                <StatCard
                                    icon={calculator}
                                    label="Total Expected"
                                    value={`${stats.totalExpected} ETB`}
                                    subtext="Active round goals"
                                    subtextColor="neutral"
                                />

                                <StatCard
                                    icon={wallet}
                                    label="Total Collected"
                                    value={`${stats.totalCollected} ETB`}
                                    subtext={`${progress.percentage}% collected`}
                                    subtextColor={progress.percentage >= 80 ? 'success' : 'neutral'}
                                />

                                <StatCard
                                    icon={people}
                                    label="Active Equbs"
                                    value={stats.activeEqubs}
                                    subtext="Currently running"
                                    subtextColor="neutral"
                                />

                                <StatCard
                                    icon={person}
                                    label="Total Members"
                                    value={stats.totalMembers}
                                    subtext="Active contributors"
                                    subtextColor="neutral"
                                />
                            </div>
                        </>
                    ) : null}
                </div>
            </IonContent>

            <BottomNav />
        </IonPage>
    );
};

export default Dashboard;
