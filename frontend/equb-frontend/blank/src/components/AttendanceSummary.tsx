interface AttendanceSummaryProps {
    totalCollected: number;
    onFinalize: () => void;
    isLoading?: boolean;
    finalizeLabel: string;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ totalCollected, onFinalize, isLoading, finalizeLabel }) => {
    return (
        <div className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-40 animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ bottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
            <div className="bg-[#007f80] rounded-[32px] p-3 flex items-center justify-between shadow-[0_20px_60px_rgba(0,127,128,0.4)] border border-[#009999]/30">
                <div className="pl-3 w-[40%] shrink-0">
                    <p className="text-[#a1bebe] text-[9px] font-bold uppercase tracking-wider mb-0.5">Total</p>
                    <div className="flex items-baseline gap-1 overflow-hidden">
                        <span className="text-white text-xl font-black truncate">{totalCollected.toLocaleString()}</span>
                        <span className="text-[#0bdada] text-[10px] font-black uppercase shrink-0">ETB</span>
                    </div>
                </div>

                <div className="flex gap-2 w-[60%] justify-end">
                    <button
                        onClick={onFinalize}
                        disabled={isLoading}
                        className="h-12 px-6 bg-white text-[#007f80] rounded-2xl font-black text-sm shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center flex-1 min-w-0"
                    >
                        {isLoading ? '...' : finalizeLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSummary;
