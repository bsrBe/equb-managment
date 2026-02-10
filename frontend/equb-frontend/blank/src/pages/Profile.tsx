import { IonContent, IonPage, IonIcon, IonSpinner, IonModal, IonToast } from '@ionic/react';
import { logOut, shieldCheckmark, chevronForward, createOutline, mail, call, close } from 'ionicons/icons';
import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { equbApi } from '../services/equbApi';
import { Admin, ApiError } from '../types/equb.types';
import BottomNav from '../components/BottomNav';

const Profile: React.FC = () => {
    const history = useHistory();
    const [profile, setProfile] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    // Security Question State
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [securityForm, setSecurityForm] = useState({
        password: '',
        question: '',
        answer: ''
    });

    // Edit Profile State
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        email: '',
        oldPassword: '',
        newPassword: ''
    });

    const fetchProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await equbApi.getProfile();
            setProfile(data);
            setEditForm({
                name: data.name || '',
                phone: data.phone || '',
                email: data.email || '',
                oldPassword: '',
                newPassword: ''
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            const error = err as ApiError;
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                history.replace('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [history]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        history.replace('/login');
    };

    const handleUpdateProfile = async () => {
        if (!profile) return;

        try {
            setIsUpdating(true);
            const updateData: {
                name: string;
                email: string;
                phone: string;
                password?: string;
                oldPassword?: string;
            } = {
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
            };

            if (editForm.newPassword) {
                if (!editForm.oldPassword) {
                    setToastMessage('Current password is required to set a new password');
                    setShowToast(true);
                    return;
                }
                updateData.password = editForm.newPassword;
                updateData.oldPassword = editForm.oldPassword;
            }

            await equbApi.updateProfile(profile.id, updateData);

            // Update local storage for other components (Header)
            const updatedUser = { ...profile, ...updateData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setToastMessage('Profile updated successfully');
            setShowToast(true);
            setIsEditModalOpen(false);
            fetchProfile();
        } catch (err) {
            console.error('Failed to update profile:', err);
            const error = err as ApiError;
            setToastMessage(error.response?.data?.message || 'Failed to update profile');
            setShowToast(true);
        } finally {
            setIsUpdating(false);
        }
    };
    const handleSetSecurityQuestion = async () => {
        if (!securityForm.password || !securityForm.question || !securityForm.answer) {
            setToastMessage('All fields are required');
            setShowToast(true);
            return;
        }

        try {
            setIsUpdating(true);
            await equbApi.setSecurityQuestion({
                password: securityForm.password,
                question: securityForm.question,
                answer: securityForm.answer
            });
            setToastMessage('Security question updated successfully');
            setShowToast(true);
            setIsSecurityModalOpen(false);
            setSecurityForm({ password: '', question: '', answer: '' });
        } catch (err) {
            console.error('Failed to set security question:', err);
            const error = err as ApiError;
            setToastMessage(error.response?.data?.message || 'Failed to update security question');
            setShowToast(true);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <IonPage>
                <IonContent fullscreen>
                    <div className="flex justify-center items-center h-screen bg-[#f5f8f8]">
                        <IonSpinner name="crescent" className="text-[#007f80]" />
                    </div>
                </IonContent>
                <BottomNav />
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="bg-[#f5f8f8] min-h-screen pb-32 font-sans text-[#111818]">
                    {/* Header bg */}
                    <div className="bg-[#007f80] h-36 rounded-b-[30px] relative">
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-[#007f80] text-3xl font-bold border border-gray-100">
                                    {profile?.name?.charAt(0) || 'A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 px-4 text-center">
                        <h2 className="text-xl font-bold text-[#111818]">{profile?.name}</h2>
                        <p className="text-gray-500 font-medium text-sm">{profile?.role || 'Admin'}</p>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-3 px-4 mt-6 mb-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                                <IonIcon icon={call} className="text-blue-500 text-sm" />
                            </div>
                            <p className="text-gray-500 font-medium uppercase text-[9px] tracking-widest">Phone</p>
                            <p className="font-bold text-[#111818] truncate text-xs">{profile?.phone}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mb-2">
                                <IonIcon icon={mail} className="text-purple-500 text-sm" />
                            </div>
                            <p className="text-gray-500 font-medium uppercase text-[9px] tracking-widest">Email</p>
                            <p className="font-bold text-[#111818] truncate text-xs">{profile?.email}</p>
                        </div>
                    </div>

                    {/* Settings List */}
                    <div className="px-4 space-y-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-full p-3 flex items-center justify-between active:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                        <IonIcon icon={createOutline} className="text-lg" />
                                    </div>
                                    <span className="font-medium text-[#111818] text-sm">Edit Profile</span>
                                </div>
                                <IonIcon icon={chevronForward} className="text-gray-300 text-sm" />
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setIsSecurityModalOpen(true)}
                                className="w-full p-3 flex items-center justify-between active:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                        <IonIcon icon={shieldCheckmark} className="text-lg" />
                                    </div>
                                    <span className="font-medium text-[#111818] text-sm">Security Question</span>
                                </div>
                                <IonIcon icon={chevronForward} className="text-gray-300 text-sm" />
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={handleLogout}
                                className="w-full p-3 flex items-center justify-between active:bg-red-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-active:scale-95 transition-transform">
                                        <IonIcon icon={logOut} className="text-lg" />
                                    </div>
                                    <span className="font-medium text-red-600 text-sm">Log Out</span>
                                </div>
                                <IonIcon icon={chevronForward} className="text-red-100 text-sm" />
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-gray-400 text-[10px] font-black uppercase tracking-widest mt-12 mb-4">Equb Manager</p>
                </div>

                {/* Edit Profile Modal */}
                <IonModal isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)}>
                    <div className="h-full bg-[#f5f8f8] flex flex-col">
                        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-3xl font-black tracking-tight">Edit Profile</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                                >
                                    <IonIcon icon={close} className="text-2xl" />
                                </button>
                            </div>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Update your details</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full h-14 bg-white border-2 border-transparent focus:border-equb-primary rounded-[20px] px-5 font-bold text-[#111818] transition-all outline-none"
                                        style={{ color: '#111818' }}
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full h-14 bg-white border-2 border-transparent focus:border-equb-primary rounded-[20px] px-5 font-bold text-[#111818] transition-all outline-none"
                                        style={{ color: '#111818' }}
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full h-14 bg-white border-2 border-transparent focus:border-equb-primary rounded-[20px] px-5 font-bold text-[#111818] transition-all outline-none"
                                        style={{ color: '#111818' }}
                                        placeholder="Enter phone"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-200 mt-6 pb-2">
                                    <p className="text-[11px] font-black text-equb-primary uppercase tracking-widest mb-4">Security</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={editForm.oldPassword}
                                                onChange={e => setEditForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                                                className="w-full h-14 bg-white border-2 border-transparent focus:border-equb-primary rounded-[20px] px-5 font-bold text-[#111818] transition-all outline-none"
                                                style={{ color: '#111818' }}
                                                placeholder="Required for password change"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">New Password</label>
                                            <input
                                                type="password"
                                                value={editForm.newPassword}
                                                onChange={e => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full h-14 bg-white border-2 border-transparent focus:border-equb-primary rounded-[20px] px-5 font-bold text-[#111818] transition-all outline-none"
                                                style={{ color: '#111818' }}
                                                placeholder="Leave blank to keep current"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isUpdating}
                                className="w-full h-14 bg-equb-primary text-white rounded-[20px] font-black shadow-lg shadow-equb-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
                            >
                                {isUpdating ? (
                                    <>
                                        <IonSpinner name="crescent" className="text-white h-5 w-5" />
                                        <span>UPDATING...</span>
                                    </>
                                ) : (
                                    'SAVE CHANGES'
                                )}
                            </button>
                        </div>
                    </div>
                </IonModal>

                {/* Security Question Modal */}
                <IonModal isOpen={isSecurityModalOpen} onDidDismiss={() => setIsSecurityModalOpen(false)}>
                    <div className="h-full bg-[#f5f8f8] flex flex-col">
                        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-3xl font-black tracking-tight">Security</h2>
                                <button
                                    onClick={() => setIsSecurityModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                                >
                                    <IonIcon icon={close} className="text-2xl" />
                                </button>
                            </div>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Set Recovery Question</p>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={securityForm.password}
                                        onChange={e => setSecurityForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full h-14 bg-white border-2 border-transparent focus:border-equb-primary rounded-[20px] px-5 font-bold text-[#111818] transition-all outline-none"
                                        style={{ color: '#111818' }}
                                        placeholder="Verify your identity"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Security Question</label>
                                    <input
                                        type="text"
                                        value={securityForm.question}
                                        onChange={e => setSecurityForm(prev => ({ ...prev, question: e.target.value }))}
                                        className="w-full h-14 bg-white border-2 border-transparent focus:border-equb-primary rounded-[20px] px-5 font-bold text-[#111818] transition-all outline-none"
                                        style={{ color: '#111818' }}
                                        placeholder="e.g. What is your mother's maiden name?"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Answer</label>
                                    <input
                                        type="text"
                                        value={securityForm.answer}
                                        onChange={e => setSecurityForm(prev => ({ ...prev, answer: e.target.value }))}
                                        className="w-full h-14 bg-white border-2 border-transparent focus:border-equb-primary rounded-[20px] px-5 font-bold text-[#111818] transition-all outline-none"
                                        style={{ color: '#111818' }}
                                        placeholder="Enter your answer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100">
                            <button
                                onClick={handleSetSecurityQuestion}
                                disabled={isUpdating}
                                className="w-full h-14 bg-equb-primary text-white rounded-[20px] font-black shadow-lg shadow-equb-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
                            >
                                {isUpdating ? (
                                    <>
                                        <IonSpinner name="crescent" className="text-white h-5 w-5" />
                                        <span>SAVING...</span>
                                    </>
                                ) : (
                                    'SAVE SECURITY QUESTION'
                                )}
                            </button>
                        </div>
                    </div>
                </IonModal>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                    position="bottom"
                    className="custom-toast"
                />
            </IonContent>
            <BottomNav />
        </IonPage>
    );
};

export default Profile;
