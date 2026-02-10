import { IonIcon } from '@ionic/react';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    subtext?: string;
    subtextColor?: 'success' | 'neutral' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    subtext,
    subtextColor = 'neutral'
}) => {
    // Determine subtext color class
    const getSubtextColorClass = () => {
        switch (subtextColor) {
            case 'success': return 'text-equb-success';
            case 'danger': return 'text-equb-danger';
            default: return 'text-equb-text-gray';
        }
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-start gap-1 hover:shadow-md transition-shadow h-full">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-full bg-gray-50 text-equb-primary">
                    <IonIcon icon={icon} className="text-lg" />
                </div>
                <span className="text-[10px] font-bold text-equb-text-gray uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-xl font-black text-equb-text-dark pl-1">{value}</span>

            {subtext && (
                <span className={`text-[10px] font-bold mt-1 ${getSubtextColorClass()}`}>
                    {subtext}
                </span>
            )}
        </div>
    );
};

export default StatCard;
