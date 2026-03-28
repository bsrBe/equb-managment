import { IonIcon } from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

interface AttendanceListItemProps {
    member: {
        id: string;
        user: {
            name: string;
            id: string;
        };
        shareType: string;
        amount: number;
        contributionDays?: number;
    };
    isPaid: boolean;
    onTogglePayment: (id: string) => void;
}

const AttendanceListItem: React.FC<AttendanceListItemProps> = ({ member, isPaid, onTogglePayment }) => {
    const history = useHistory();

    return (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => history.push(`/user-insights/${member.user.id}`)}
            >
                <div className="w-12 h-12 rounded-lg bg-equb-primary/10 flex items-center justify-center overflow-hidden border border-equb-primary/10 shrink-0">
                    <img
                        src={`https://i.pravatar.cc/150?u=${member.user.id}`}
                        alt={member.user.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-base font-bold text-equb-text-dark leading-tight truncate">{member.user.name}</h4>
                    <p className="text-[10px] text-equb-text-gray font-bold uppercase tracking-wider mt-0.5">
                        {member.shareType === 'FULL' ? '1.0 Share' :
                            member.shareType === 'HALF' ? '1/2 Share' :
                                member.shareType === 'QUARTER' ? '1/4 Share' : member.shareType} • <span className="text-equb-primary">{member.amount.toLocaleString()} ETB</span> {member.contributionDays !== undefined && `• ${member.contributionDays} Days`}
                    </p>
                </div>
            </div>

            {isPaid ? (
                <div className="w-12 h-12 flex items-center justify-center text-equb-primary shrink-0">
                    <IonIcon icon={checkmarkCircle} className="text-3xl" />
                </div>
            ) : (
                <button
                    onClick={() => onTogglePayment(member.id)}
                    className={`h-8 w-16 flex items-center justify-center transition-all shrink-0 text-xs font-bold !rounded-lg shadow-[0_4px_12px_-2px_rgba(0,128,128,0.4)] active:scale-95 ${isPaid
                        ? 'bg-green-500 text-white shadow-none'
                        : 'bg-[#008080] text-white'
                        }`}
                    style={{ borderRadius: '10px' }} >
                    {isPaid ? (
                        <IonIcon icon={checkmarkCircle} className="text-lg" />
                    ) : (
                        'Pay'
                    )}
                </button>
            )}
        </div>
    );
};

export default AttendanceListItem;
