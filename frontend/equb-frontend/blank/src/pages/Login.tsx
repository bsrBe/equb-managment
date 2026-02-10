import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { wallet, eye, eyeOff } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
    const history = useHistory();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://equb-managment.onrender.com';

            // Append prefix for API logic if needed, but UI shows separated
            const fullPhone = `+251${phone}`;

            const response = await axios.post(`${API_URL}/auth/adminLogin`, {
                phone: fullPhone,
                password
            });

            const { accessToken, admin } = response.data;

            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('user', JSON.stringify(admin));

            history.push('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            let message = 'Login failed. Please check your credentials.';
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                message = err.response.data.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="relative flex min-h-screen w-full flex-col bg-white overflow-x-hidden font-sans text-gray-900">
                    {/* TopAppBar */}
                    <div className="flex items-center bg-white p-4 pb-2 justify-between">
                        <div className="w-10"></div>
                        <h2 className="text-[#007f80] text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                            EqubDigital
                        </h2>
                        <div className="w-10"></div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center px-4 max-w-[480px] mx-auto w-full">
                        {/* Header Image / Logo Section */}
                        <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-[#007f80]/10 rounded-full flex items-center justify-center">
                                <IonIcon icon={wallet} className="text-5xl text-[#007f80]" />
                            </div>
                        </div>

                        {/* Headline */}
                        <h2 className="text-[#101818] tracking-tight text-[28px] font-bold leading-tight text-center pb-2">
                            Welcome Back
                        </h2>
                        <p className="text-[#5e8d8d] text-center text-sm mb-8">
                            Secure access to your community savings
                        </p>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            {/* Phone Number Field */}
                            <div className="flex flex-col gap-1 py-2 mb-2">
                                <label className="flex flex-col flex-1">
                                    <p className="text-[#101818] text-sm font-medium leading-normal pb-2">Phone Number</p>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#007f80] font-semibold">
                                            +251
                                        </span>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-16 pr-4 py-4 bg-white border border-[#dae7e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007f80]/20 text-base font-normal text-[#101818] h-14"
                                            placeholder="912345678"
                                            required
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-1 py-2 mb-2">
                                <label className="flex flex-col flex-1">
                                    <p className="text-[#101818] text-sm font-medium leading-normal pb-2">Password</p>
                                    <div className="relative flex w-full items-stretch rounded-lg group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-4 bg-white border border-[#dae7e7] border-r-0 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#007f80]/20 text-base font-normal text-[#101818] h-14 placeholder:text-[#5e8d8d]"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="flex items-center justify-center px-4 bg-white border border-[#dae7e7] border-l-0 rounded-r-lg"
                                        >
                                            <IonIcon
                                                icon={showPassword ? eyeOff : eye}
                                                className="text-[#5e8d8d] text-xl cursor-pointer"
                                            />
                                        </button>
                                    </div>
                                </label>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end pt-1">
                                <button onClick={() => history.push('/forgot-password')} className="text-[#007f80] text-sm font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer">
                                    Forgot Password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#007f80] hover:bg-[#006666] text-white font-bold py-5 rounded-3xl shadow-[0_12px_40px_rgb(0,127,128,0.3)] transition-all active:scale-[0.96] flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">
                                        {isLoading ? 'Signing In...' : 'Login'}
                                    </span>
                                </button>
                            </div>

                            {/* Register as Collector */}
                            <div className="pt-6 text-center">
                                <p className="text-[#5e8d8d] text-sm">
                                    New to the community?{' '}
                                    <a
                                        onClick={() => history.push('/register-admin')}
                                        className="text-[#007f80] font-bold hover:underline cursor-pointer"
                                    >
                                        Register as Collector
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Footer Branding */}
                    <div className="p-8 text-center mt-auto">
                        <p className="text-[#5e8d8d] text-xs uppercase tracking-widest font-semibold">
                            EqubDigital Manager
                        </p>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;
