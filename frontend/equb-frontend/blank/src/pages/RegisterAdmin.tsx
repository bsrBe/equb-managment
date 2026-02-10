
import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import { arrowBack, person, mail, call, lockClosed, shieldCheckmark } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { equbApi } from '../services/equbApi';
import { ApiError } from '../types/equb.types';

const RegisterAdmin: React.FC = () => {
    const history = useHistory();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !email || !password) return;

        setIsLoading(true);
        setError(null);

        try {
            // Format phone number to match backend expectation (similar to Login.tsx)
            const fullPhone = phone.startsWith('+') ? phone : `+251${phone.replace(/^0/, '')}`;

            await equbApi.createAdmin({
                name,
                phone: fullPhone,
                email,
                password
            });

            // Redirect to login on success
            history.push('/login');
        } catch (err) {
            console.error('Registration error:', err);
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Failed to register admin');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-white min-h-screen flex flex-col font-sans text-[#111818]">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex items-center bg-white p-4 justify-between">
                        <button
                            onClick={() => history.push('/login')}
                            className="text-[#101818] flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
                        >
                            <IonIcon icon={arrowBack} className="text-xl" />
                        </button>
                        <h2 className="text-[#101818] text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
                            Admin Registration
                        </h2>
                    </header>

                    <main className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-[#007f80]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IonIcon icon={shieldCheckmark} className="text-4xl text-[#007f80]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#111818]">Create Account</h1>
                            <p className="text-[#608a8a] mt-2">Sign up to manage your Equb community</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#111818]">Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <IonIcon icon={person} className="text-xl" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007f80]/20 focus:border-[#007f80] font-bold text-[#111818] placeholder-gray-400"
                                        style={{ color: '#111818' }}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#111818]">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#007f80] font-semibold">
                                        +251
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007f80]/20 focus:border-[#007f80] font-bold text-[#111818] placeholder-gray-400"
                                        style={{ color: '#111818' }}
                                        placeholder="912345678"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#111818]">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <IonIcon icon={mail} className="text-xl" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007f80]/20 focus:border-[#007f80] font-bold text-[#111818] placeholder-gray-400"
                                        style={{ color: '#111818' }}
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#111818]">Password</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <IonIcon icon={lockClosed} className="text-xl" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007f80]/20 focus:border-[#007f80] font-bold text-[#111818] placeholder-gray-400"
                                        style={{ color: '#111818' }}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#007f80] hover:bg-[#006666] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#007f80]/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <IonSpinner name="crescent" color="light" className="h-5 w-5" />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    'Register Admin'
                                )}
                            </button>
                        </form>
                    </main>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default RegisterAdmin;
