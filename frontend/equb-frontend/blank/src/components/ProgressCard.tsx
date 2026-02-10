interface ProgressCardProps {
    percentage: number;
    current: number;
    goal: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ percentage = 0, current = 0, goal = 0 }) => {
    // SVG circle calculations
    const radius = 75; // Reduced from 90
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm mx-4 my-4">
            {/* Circular Progress */}
            <div className="flex justify-center items-center mb-6">
                <div className="relative w-44 h-44">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 176 176">
                        {/* Background circle */}
                        <circle
                            cx="88"
                            cy="88"
                            r={radius}
                            stroke="#E5E7EB"
                            strokeWidth="10"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="88"
                            cy="88"
                            r={radius}
                            stroke="var(--ion-color-primary)"
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-equb-text-dark">{Math.round(percentage)}%</span>
                        <span className="text-[10px] font-medium text-equb-text-gray uppercase tracking-wider">COLLECTED</span>
                    </div>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-center text-base font-semibold text-equb-text-dark mb-4">
                Today's Collection Progress
            </h3>

            {/* Stats row */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-xs text-equb-text-gray uppercase tracking-wide">CURRENT</span>
                    <span className="text-2xl font-bold text-equb-primary">
                        {(current || 0).toLocaleString()} <span className="text-sm">ETB</span>
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs text-equb-text-gray uppercase tracking-wide">ROUND GOAL</span>
                    <span className="text-2xl font-bold text-equb-text-dark">
                        {(goal || 0).toLocaleString()} <span className="text-sm">ETB</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProgressCard;
