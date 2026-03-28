interface ProgressCardProps {
    percentage: number;
    current: number;
    goal: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ percentage = 0, current = 0, goal = 0 }) => {
    // SVG circle calculations
    const radius = 75;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white !rounded-3xl p-6 shadow-xl border border-gray-50 mx-4 my-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Title */}
            <h3 className="text-center text-[11px] font-black text-[#a1bebe] uppercase tracking-[0.2em] mb-6">
                Collection Progress
            </h3>

            {/* Circular Progress */}
            <div className="flex justify-center items-center mb-8">
                <div className="relative w-44 h-44">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 176 176">
                        {/* Background circle */}
                        <circle
                            cx="88"
                            cy="88"
                            r={radius}
                            stroke="#f4f8f8"
                            strokeWidth="12"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="88"
                            cy="88"
                            r={radius}
                            stroke="#008080"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-[#101818] tracking-tight">{Math.round(percentage)}%</span>
                        <span className="text-[10px] font-black text-[#008080] uppercase tracking-widest mt-1">COLLECTED</span>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="flex justify-between items-center bg-[#f8fafb] rounded-[24px] p-5 border border-gray-50">
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#608a8a] font-bold uppercase tracking-wider mb-1">CURRENT</span>
                    <span className="text-xl font-black text-[#008080]">
                        {(current || 0).toLocaleString()} <span className="text-xs font-bold opacity-60">ETB</span>
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#608a8a] font-bold uppercase tracking-wider mb-1">ROUND GOAL</span>
                    <span className="text-xl font-black text-[#101818]">
                        {(goal || 0).toLocaleString()} <span className="text-xs font-bold opacity-40">ETB</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProgressCard;

