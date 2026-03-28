import React, { useRef, useEffect } from 'react';
import { Period } from '../types/equb.types';

interface PeriodScrollerProps {
    periods: Period[];
    selectedSequence: number;
    onSelect: (period: Period) => void;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

const PeriodScroller: React.FC<PeriodScrollerProps> = ({ periods, selectedSequence, onSelect, type }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to selected element
    useEffect(() => {
        if (scrollRef.current) {
            const selectedElement = scrollRef.current.querySelector('[data-selected="true"]');
            if (selectedElement) {
                selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [selectedSequence]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isToday = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const getLabel = (period: Period) => {
        if (isToday(period.startDate)) return "Today";
        if (type === 'DAILY') return `Day ${period.sequence}`;
        if (type === 'WEEKLY') return `Week ${period.sequence}`;
        return `Month ${period.sequence}`;
    };

    // Filter duplicates by sequence (backend fix is primary, this is safety)
    const uniquePeriods = periods.reduce((acc: Period[], current) => {
        const x = acc.find(item => item.sequence === current.sequence);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    // Sort uniquely filtered periods by sequence
    const sortedPeriods = uniquePeriods.sort((a, b) => a.sequence - b.sequence);

    return (
        <div className="px-6 pt-4 pb-2">
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-6 px-6"
            >
                {sortedPeriods.map((period) => {
                    const isSelected = period.sequence === selectedSequence;
                    const today = isToday(period.startDate);
                    return (
                        <button
                            key={period.id}
                            data-selected={isSelected}
                            onClick={() => onSelect(period)}
                            className={`flex flex-col items-center justify-center min-w-[85px] h-[95px] rounded-2xl transition-all duration-300 ${isSelected
                                    ? 'bg-[#008080] text-white shadow-[0_12px_24px_rgba(0,128,128,0.4)] scale-105 z-10'
                                    : today
                                        ? 'bg-[#008080]/10 border-2 border-[#008080]/40 text-[#008080]'
                                        : 'bg-white border border-gray-100 text-[#608A8A] hover:bg-gray-50'
                                }`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isSelected ? 'text-white/70' : today ? 'text-[#008080]/60' : 'text-[#608A8A]/60'}`}>
                                {getLabel(period)}
                            </span>
                            <span className={`text-[15px] font-black ${isSelected ? 'text-white' : today ? 'text-[#008080]' : 'text-[#111818]'}`}>
                                {formatDate(period.startDate)}
                            </span>
                            {isSelected && (
                                <div className="mt-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PeriodScroller;
