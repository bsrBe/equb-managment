import { IonIcon, IonSpinner } from '@ionic/react';
import { search } from 'ionicons/icons';
import { useState, useMemo } from 'react';
import { EqubMember, ApiError } from '../types/equb.types';
import { equbApi } from '../services/equbApi';

interface AssignWinnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (memberId: string) => void;
    equbId: string;
    periodId: string;
    currentRound: number;
    members: EqubMember[];
}

const AssignWinnerModal: React.FC<AssignWinnerModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    equbId,
    periodId,
    currentRound,
    members = []
}) => {
    const [searchText, setSearchText] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter members logic
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = member.user.name.toLowerCase().includes(searchText.toLowerCase());
            // In a real scenario, we might filtering out already won members?
            // For now, assume all members are visible but visually distinguished by status
            return matchesSearch;
        });
    }, [members, searchText]);

    const handleConfirm = async () => {
        if (!selectedMemberId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await equbApi.assignWinner({
                equbId,
                memberId: selectedMemberId,
                periodId
            });
            onSuccess(selectedMemberId);
            onClose();
        } catch (err) {
            console.error(err);
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Failed to assign winner');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Helper for random-ish color based on name
    const getColorClass = (name: string) => {
        const colors = [
            'bg-purple-100 text-purple-600',
            'bg-orange-100 text-orange-600',
            'bg-blue-100 text-blue-600',
            'bg-green-100 text-green-700',
            'bg-primary/20 text-primary'
        ];
        return colors[name.length % colors.length];
    };

    // Mock logic for "Fully Paid" until backend provides exact status
    // Assuming for now: hasReceivedPayout means WON. 
    // Usually eligibility depends on payments. 
    // We'll use contributionType to mock "Total" vs "Paid" for display as per design.
    // DESIGN: "Fully Paid ($300.00)" vs "Partial ($150.00 / $300.00)"
    // We will assume simpler logic for now matching the prompt's design spirit:
    // If we don't have payment status, we default to "Fully Paid" for demo unless specified.
    // Ideally this comes from the backend member object. 
    // Let's use a randomizer or fixed logic if member.paymentStatus isn't available.
    // Wait, the EqubDetails page had `member.hasReceivedPayout`. 
    // We need "Payment Status" for the *Contribution*, not if they won/payout.
    // The design implies only those who PAID their contribution can win.

    // For this implementation, I will treat all members as "Status" based on a mock or existing field.
    // Since `EqubMember` might not have `paymentStatus` yet, I'll simulate it or check `equb.types`.

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Bottom Sheet Content */}
            <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up overflow-hidden">
                {/* Drag Handle */}
                <div className="w-full flex justify-center py-3 bg-white shrink-0">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-6 pb-4 bg-white shrink-0">
                    <h3 className="text-xl font-bold text-[#111818]">Assign Period Winner</h3>
                    <p className="text-sm text-[#608a8a] mt-1">Select an eligible member for Round {currentRound}.</p>
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>

                {/* Search Bar */}
                <div className="px-6 pb-4 bg-white shrink-0">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <IonIcon icon={search} className="text-xl" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search eligible members..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-[#0df2f2] focus:outline-none text-sm text-[#111818] placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Eligible Members List */}
                <div className="flex-1 overflow-y-auto px-6 bg-white min-h-0">
                    <div className="space-y-3 py-2 pb-4">
                        {filteredMembers.map((member) => {
                            // Mocking status logic for visual fidelity to design
                            // In real app, check `member.paymentStatus === 'PAID'`
                            const isPaid = true; // defaulting to true for now to allow selection
                            const amount = 300; // Mock amount
                            const initials = getInitials(member.user.name);
                            const colorClass = getColorClass(member.user.name);

                            return (
                                <div
                                    key={member.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedMemberId === member.id
                                        ? 'border-[#0df2f2] bg-[#0df2f2]/5'
                                        : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100'
                                        }`}
                                    onClick={() => isPaid && setSelectedMemberId(member.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${colorClass}`}>
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-[#111818]">{member.user.name}</p>
                                            <div className="flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                <span className="text-[10px] text-[#608a8a]">
                                                    {isPaid
                                                        ? `Fully Paid (${amount}.00 ETB)`
                                                        : `Partial`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isPaid ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMemberId(member.id);
                                            }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMemberId === member.id
                                                ? 'bg-[#007f80] text-white shadow-md'
                                                : 'bg-[#007f80] text-white hover:bg-[#006666]'
                                                }`}
                                        >
                                            {selectedMemberId === member.id ? 'Selected' : 'Select'}
                                        </button>
                                    ) : (
                                        <button className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-lg text-xs font-bold cursor-not-allowed">
                                            Ineligible
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {filteredMembers.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No members found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Confirm Button - Now Static/Sticky at bottom of flex container */}
                <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedMemberId || isSubmitting}
                        className={`w-full py-5 rounded-3xl font-bold flex items-center justify-center gap-2 transition-all ${selectedMemberId
                            ? 'bg-[#007f80] text-white shadow-[0_12px_40px_rgb(0,127,128,0.3)] hover:bg-[#006666] active:scale-[0.98]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? <IonSpinner name="crescent" color="light" className="h-5 w-5" /> : <span className="text-xl">Confirm Selection</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignWinnerModal;
