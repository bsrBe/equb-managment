import { IonIcon } from '@ionic/react';
import { chevronForward } from 'ionicons/icons';

interface EqubCardProps {
    id: string;
    name: string;
    // icon and iconBgColor removed as they were unused and causing lint errors
    currentRound: number;
    totalRounds: number;
    progress: number;
    onClick?: () => void;
}

const EqubCard: React.FC<EqubCardProps> = ({
    name,
    currentRound,
    totalRounds,
    progress,
    onClick,
}) => {
    // SVG circle calculations for small progress ring
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl p-3 mx-4 mb-3 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow border border-gray-50"
        >
            <div className="flex items-center gap-3 flex-1">
                {/* Text content */}
                <div className="flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-equb-text-dark truncate leading-tight">{name}</h3>
                    <p className="text-[10px] font-bold text-equb-text-gray uppercase tracking-tight mt-0.5">
                        Round {currentRound} of {totalRounds}
                    </p>
                </div>
            </div>

            {/* Progress and chevron */}
            <div className="flex items-center gap-3">
                {/* Small circular progress */}
                <div className="relative w-12 h-12">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            stroke="#E5E7EB"
                            strokeWidth="4"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            stroke="var(--ion-color-primary)"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-equb-text-dark">{progress}%</span>
                    </div>
                </div>

                {/* Chevron */}
                <IonIcon icon={chevronForward} className="text-xl text-gray-300" />
            </div>
        </div>
    );
};

export default EqubCard;
