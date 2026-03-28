import { IonButton, IonIcon } from '@ionic/react';
import { close, helpCircleOutline, calendar, bulb, checkmark } from 'ionicons/icons';
import { useState } from 'react';
import { CreateEqubDto, ApiError } from '../types/equb.types';
import { equbApi } from '../services/equbApi';
import { formatErrorMessage } from '../utils/errorUtils';

interface CreateEqubModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateEqubModal: React.FC<CreateEqubModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<CreateEqubDto>({
        name: '',
        type: 'WEEKLY',
        startDate: undefined,
        defaultContributionAmount: 0,
        totalRounds: 74,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await equbApi.create(formData);
            setFormData({
                name: '',
                type: 'WEEKLY',
                startDate: undefined,
                defaultContributionAmount: 0,
                totalRounds: 74,
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(formatErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof CreateEqubDto, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const estimatedMembers = 12;
    const estimatedTotal = formData.defaultContributionAmount * estimatedMembers;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-10 rounded-t-3xl">
                    <div className="flex items-center justify-between p-4">
                        <IonButton fill="clear" onClick={onClose} className="m-0">
                            <IonIcon slot="icon-only" icon={close} className="text-2xl" />
                        </IonButton>
                        <h2 className="text-lg font-bold text-equb-text-dark">Setup New Equb</h2>
                        <IonButton fill="clear" className="m-0">
                            <IonIcon slot="icon-only" icon={helpCircleOutline} className="text-2xl" />
                        </IonButton>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</div>
                            <p className="text-sm font-semibold text-red-700 leading-tight">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Equb Name */}
                    <div>
                        <label className="block text-base font-semibold text-equb-text-dark mb-2">
                            Equb Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g. Family Savings 2024"
                            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400 bg-white"
                            style={{ color: '#111827' }}
                        />
                    </div>

                    {/* Frequency */}
                    <div>
                        <h3 className="text-lg font-bold text-[#111818] mb-2">Frequency</h3>
                        <div className="flex h-11 items-center justify-center rounded-xl bg-gray-100 p-1">
                            {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((freq) => (
                                <button
                                    key={freq}
                                    type="button"
                                    onClick={() => {
                                        handleChange('type', freq);
                                        if (freq === 'WEEKLY') {
                                            handleChange('totalRounds', 74);
                                        } else if (freq === 'MONTHLY') {
                                            handleChange('totalRounds', 12);
                                        } else {
                                            // DAILY might be infinite, but let's set a default or leave as is
                                            handleChange('totalRounds', 365);
                                        }
                                    }}
                                    className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-semibold transition-all ${formData.type === freq
                                        ? 'bg-white shadow-sm text-[#111818]'
                                        : 'text-[#608a8a] hover:text-gray-700'
                                        }`}
                                >
                                    <span className="truncate">{freq.charAt(0) + freq.slice(1).toLowerCase()}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-[#608a8a] mt-2">
                            Members will contribute every {formData.type.toLowerCase()} on the same day.
                        </p>
                    </div>

                    {/* Base Contribution */}
                    <div>
                        <h3 className="text-lg font-bold text-equb-text-dark mb-2">Base Contribution</h3>
                        <p className="text-sm font-medium text-equb-text-dark mb-2">Amount (ETB)</p>
                        <div className="flex items-stretch border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                            <div className="px-4 py-3.5 bg-gray-100 border-r border-gray-300 flex items-center">
                                <span className="font-bold text-equb-text-dark">ETB</span>
                            </div>
                            <input
                                type="number"
                                required
                                min="1"
                                step="100"
                                value={formData.defaultContributionAmount || ''}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    handleChange('defaultContributionAmount', isNaN(val) ? 0 : Math.max(1, val));
                                }}
                                placeholder="0.00"
                                className="flex-1 px-4 py-3.5 focus:outline-none text-xl font-bold bg-white"
                                style={{ color: '#111827' }}
                            />
                        </div>
                    </div>

                    {/* Total Rounds */}
                    <div>
                        <label className="block text-base font-semibold text-equb-text-dark mb-2">
                            Total Rounds
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.totalRounds || ''}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                handleChange('totalRounds', isNaN(val) ? 0 : Math.max(1, val));
                            }}
                            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            style={{ color: '#111827' }}
                        />
                        <p className="text-xs text-[#608a8a] mt-2">
                            Number of payout cycles. Default is {formData.type === 'WEEKLY' ? '74' : '12'}.
                        </p>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-base font-semibold text-equb-text-dark mb-2 flex items-center justify-between">
                            Start Date
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest pl-2 opacity-60">Optional</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                                <IonIcon icon={calendar} className="text-2xl text-primary" />
                            </div>
                            <input
                                type="date"
                                value={formData.startDate || ''}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full pl-14 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                style={{ colorScheme: 'light', color: '#111827' }}
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <IonIcon icon="chevron-forward-outline" className="text-xl text-gray-400" />
                            </div>
                        </div>
                        <p className="text-[10px] text-[#608a8a] mt-2 italic">
                            Leave empty to start as "Pending" (admin activation required).
                        </p>
                    </div>

                    {/* Equb Summary */}
                    {formData.defaultContributionAmount > 0 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <IonIcon icon={bulb} className="text-lg text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-equb-text-dark">Equb Summary</p>
                                <p className="text-xs text-equb-text-gray">
                                    Estimated total payout for {estimatedMembers} members: {estimatedTotal.toLocaleString()} ETB
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Ready to Launch */}
                    <div className="flex flex-col items-center justify-center opacity-40 py-4">
                        <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
                            <IonIcon icon={checkmark} className="text-primary" />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-primary mt-2">
                            Ready to launch
                        </p>
                    </div>
                </form>

                {/* Submit Button - Fixed at bottom */}
                {/* <div className="sticky bottom-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 rounded-b-3xl">
                    <IonButton
                        expand="block"
                        type="submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className="text-lg font-bold h-14"
                        style={{ '--background': '#0bdada', '--color': '#102222' }}
                    >
                        {isLoading ? 'Creating...' : 'Create New Equb'}
                    </IonButton>
                </div> */}
                <div className="sticky bottom-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 rounded-b-3xl">
                    <IonButton
                        expand="block"
                        type="submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className="h-14 text-lg" // Keeping height consistent with Login button
                        style={{
                            '--background': '#0bdada',
                            '--color': '#102222',
                            '--border-radius': '16px', // This is the fix for rounding IonButton
                            '--box-shadow': '0 10px 20px -5px rgba(11, 218, 218, 0.4)', // Adds the glow
                            'font-weight': '700'
                        }}
                    >
                        {isLoading ? 'Creating...' : 'Create New Equb'}
                    </IonButton>
                </div>
            </div>
        </div>
    );
};

export default CreateEqubModal;
