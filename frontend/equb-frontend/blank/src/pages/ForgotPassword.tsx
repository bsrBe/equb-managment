
import { IonContent, IonPage, IonIcon, useIonToast } from '@ionic/react';
import { arrowBack, shieldCheckmark, key, call, helpCircle } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { equbApi } from '../services/equbApi';
import { ApiError } from '../types/equb.types';

const ForgotPassword: React.FC = () => {
    const history = useHistory();
    const [present] = useIonToast();
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [phone, setPhone] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Step 1: Find User
    const handleFindUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const fullPhone = phone.startsWith('+251') ? phone : `+251${phone}`;
            const data = await equbApi.getSecurityQuestion(fullPhone);
            setSecurityQuestion(data.question);
            setStep(2);
        } catch (err) {
            console.error(err);
            const error = err as ApiError;
            present({
                message: error.response?.data?.message || 'User not found or security question not set.',
                duration: 3000,
                color: 'danger',
                position: 'top'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const fullPhone = phone.startsWith('+251') ? phone : `+251${phone}`;
            await equbApi.resetPassword({
                phone: fullPhone,
                answer: securityAnswer,
                newPassword
            });

            present({
                message: 'Password reset successfully! Please login.',
                duration: 3000,
                color: 'success',
                position: 'top'
            });

            history.replace('/login');
        } catch (err) {
            console.error(err);
            const error = err as ApiError;
            present({
                message: error.response?.data?.message || 'Incorrect answer. Please try again.',
                duration: 3000,
                color: 'danger',
                position: 'top'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="min-h-screen bg-white flex flex-col">
                    {/* Header */}
                    <div className="p-4 flex items-center">
                        <button
                            onClick={() => history.goBack()}
                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 active:bg-gray-100 transition-colors"
                        >
                            <IonIcon icon={arrowBack} className="text-xl" />
                        </button>
                    </div>

                    <div className="flex-1 px-6 pb-8 flex flex-col justify-center max-w-md mx-auto w-full">
                        <div className="mb-8 text-center">
                            <div className="w-20 h-20 bg-[#007f80]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <IonIcon icon={shieldCheckmark} className="text-4xl text-[#007f80]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#111818] mb-2">Account Recovery</h1>
                            <p className="text-gray-500">
                                {step === 1
                                    ? "Enter your phone number to find your account"
                                    : "Answer your security question to reset password"
                                }
                            </p>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleFindUser} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#111818]">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#007f80]">
                                            <IonIcon icon={call} className="text-xl" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-14 pr-4 h-14 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#007f80] focus:ring-1 focus:ring-[#007f80] transition-all font-medium text-[#111818]"
                                            placeholder="912345678"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-[#007f80] text-white rounded-2xl font-bold text-lg active:scale-[0.98] transition-all shadow-lg shadow-[#007f80]/20 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Searching...' : 'Find Account'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 mb-2">
                                    <p className="text-xs text-teal-600 font-bold uppercase tracking-wider mb-1">Security Question</p>
                                    <p className="text-[#007f80] font-medium text-lg">{securityQuestion}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#111818]">Your Answer</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#007f80]">
                                            <IonIcon icon={helpCircle} className="text-xl" />
                                        </div>
                                        <input
                                            type="text"
                                            value={securityAnswer}
                                            onChange={(e) => setSecurityAnswer(e.target.value)}
                                            className="w-full pl-14 pr-4 h-14 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#007f80] focus:ring-1 focus:ring-[#007f80] transition-all font-medium text-[#111818]"
                                            placeholder="Enter your answer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#111818]">New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#007f80]">
                                            <IonIcon icon={key} className="text-xl" />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-14 pr-4 h-14 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#007f80] focus:ring-1 focus:ring-[#007f80] transition-all font-medium text-[#111818]"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-[#007f80] text-white rounded-2xl font-bold text-lg active:scale-[0.98] transition-all shadow-lg shadow-[#007f80]/20 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ForgotPassword;
