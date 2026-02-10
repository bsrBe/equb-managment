import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import { arrowBack, alertCircle as errorIcon } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { equbApi } from '../services/equbApi';
import { ApiError } from '../types/equb.types';

const RegisterMember: React.FC = () => {
    const history = useHistory();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;

        setIsLoading(true);
        setError(null);

        try {
            const cleanPhone = phone.replace(/\s+/g, '');
            const response = await equbApi.registerUser({
                name,
                phone: cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`
            });

            history.push({
                pathname: '/registration-success',
                state: { member: { name: response.name, id: response.id || 'EQB-2023-042' } }
            });
        } catch (err) {
            console.error('Registration error:', err);
            const error = err as ApiError;
            setError(error.response?.data?.message || 'This phone number is already registered to Abel Tesfaye');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-[#f5f8f8] min-h-screen flex flex-col font-sans text-[#111818]">
                    {/* Top Navigation Bar */}
                    <header className="sticky top-0 z-10 flex items-center bg-white border-b border-gray-100 p-4 justify-between shadow-sm">
                        <button
                            onClick={() => history.goBack()}
                            className="text-[#101818] flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
                        >
                            <IonIcon icon={arrowBack} className="text-xl" />
                        </button>
                        <h2 className="text-[#101818] text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
                            New Member Registration
                        </h2>
                    </header>

                    {/* Main Content Container */}
                    <main className="flex-1 w-full max-w-md mx-auto py-10 flex flex-col justify-center">
                        {/* Headline Section */}
                        <div className="px-6 text-center">
                            <h3 className="text-[#101818] tracking-tight text-3xl font-extrabold leading-tight">
                                Add a new member
                            </h3>
                            <p className="text-[#608a8a] mt-3 text-lg leading-relaxed px-4">
                                Enter the details below to invite them to the Equb community.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-12 space-y-8">
                            {/* Full Name Input */}
                            <div className="flex flex-col px-6">
                                <label className="flex flex-col w-full">
                                    <p className="text-[#101818] text-sm font-bold uppercase tracking-wider leading-normal pb-3">Full Name</p>
                                    <input
                                        className="form-input flex w-full rounded-2xl text-[#101818] focus:outline-0 focus:ring-4 focus:ring-[#007f80]/10 border border-[#dae7e7] bg-white focus:border-[#007f80] h-16 placeholder:text-gray-300 p-[20px] text-lg font-medium transition-all shadow-sm"
                                        placeholder="e.g. Abel Tesfaye"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>

                            {/* Country & Phone Number Input */}
                            <div className="px-6">
                                <p className="text-[#101818] text-sm font-bold uppercase tracking-wider leading-normal pb-3">Phone Number</p>
                                <div className="flex gap-3">
                                    {/* Country Code Selector */}
                                    <div className="flex items-center gap-2 px-5 h-16 rounded-2xl border border-[#dae7e7] bg-white min-w-[120px] justify-center shadow-sm">
                                        <img
                                            alt="Ethiopia Flag"
                                            className="w-7 h-5 rounded-sm object-cover shadow-sm"
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/1200px-Flag_of_Ethiopia.svg.png"
                                        />
                                        <span className="text-[#101818] font-bold text-lg">+251</span>
                                    </div>
                                    {/* Phone Input */}
                                    <label className="flex-1">
                                        <input
                                            className={`form-input flex w-full rounded-2xl text-[#101818] focus:outline-0 focus:ring-4 focus:ring-[#007f80]/10 border ${error ? 'border-red-500' : 'border-[#dae7e7]'} bg-white focus:border-[#007f80] h-16 placeholder:text-gray-300 p-[20px] text-lg font-medium transition-all shadow-sm`}
                                            type="tel"
                                            placeholder="911 22 33 44"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="px-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-start gap-4 bg-red-50 p-5 rounded-2xl border border-red-100">
                                        <div className="text-red-500 flex items-center justify-center shrink-0">
                                            <IonIcon icon={errorIcon} className="text-2xl" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-red-700 text-base font-semibold leading-normal">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </main>

                    {/* Fixed Bottom Action Area */}
                    <footer className="mt-auto p-8 bg-white border-t border-gray-100">
                        <div className="max-w-md mx-auto">
                            <button
                                onClick={handleSubmit}
                                disabled={!name || !phone || isLoading}
                                className={`w-full py-6 rounded-3xl font-extrabold text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${!name || !phone || isLoading
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-[#007f80] text-white hover:bg-[#006666] active:scale-[0.98] shadow-[#007f80]/20'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <IonSpinner name="crescent" color="light" className="h-6 w-6" />
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    'Register Member'
                                )}
                            </button>
                            <p className="text-center text-xs text-[#a1bebe] mt-6 px-10 leading-relaxed font-medium">
                                By registering, you agree to the <span className="text-[#007f80] underline cursor-pointer">Terms</span> and <span className="text-[#007f80] underline cursor-pointer">Privacy Policy</span>.
                            </p>
                        </div>
                    </footer>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default RegisterMember;
