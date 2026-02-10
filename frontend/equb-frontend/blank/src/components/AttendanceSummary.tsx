import { IonIcon } from '@ionic/react';
import { send } from 'ionicons/icons';

interface AttendanceSummaryProps {
    totalCollected: number;
    onFinalize: () => void;
    isLoading?: boolean;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ totalCollected, onFinalize, isLoading }) => {
    return (
        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-40 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-[#007f80] rounded-[32px] p-3 flex items-center justify-between shadow-[0_20px_60px_rgba(0,127,128,0.4)] border border-[#009999]/30">
                <div className="pl-3 w-[35%] shrink-0">
                    <p className="text-[#a1bebe] text-[9px] font-bold uppercase tracking-wider mb-0.5">Total</p>
                    <div className="flex items-baseline gap-1 overflow-hidden">
                        <span className="text-white text-xl font-black truncate">{totalCollected.toLocaleString()}</span>
                        <span className="text-[#0bdada] text-[10px] font-black uppercase shrink-0">ETB</span>
                    </div>
                </div>

                <div className="flex gap-2 w-[65%] justify-end">
                    <button className="w-12 h-12 rounded-2xl bg-[#009999]/30 flex items-center justify-center text-white active:scale-95 transition-all shrink-0">
                        <IonIcon icon={send} className="text-xl" />
                    </button>
                    <button
                        onClick={onFinalize}
                        disabled={isLoading}
                        className="h-12 px-4 bg-white text-[#007f80] rounded-2xl font-black text-sm shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center flex-1 min-w-0"
                    >
                        {isLoading ? '...' : 'Finalize Week'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSummary;
