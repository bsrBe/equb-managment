import { IonModal, IonContent, IonIcon, IonSpinner } from '@ionic/react';
import { close, search, checkmarkCircle } from 'ionicons/icons';
import { useState, useEffect, useCallback } from 'react';
import { equbApi } from '../services/equbApi';
import { ApiError } from '../types/equb.types';
import { User } from '../types/equb.types';

interface AddMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    equbId: string;
    equbName: string;
    existingMemberUserIds: string[];
    onMembersAdded: () => void;
}

interface SelectedUser {
    user: User;
    contributionType: 'FULL' | 'HALF' | 'QUARTER';
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({
    isOpen,
    onClose,
    equbId,
    equbName,
    existingMemberUserIds,
    onMembersAdded
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<Map<string, SelectedUser>>(new Map());
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await equbApi.getUsers(searchQuery);
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, fetchUsers]);

    const handleUserToggle = (user: User) => {
        const newSelected = new Map(selectedUsers);
        if (newSelected.has(user.id)) {
            newSelected.delete(user.id);
        } else {
            newSelected.set(user.id, { user, contributionType: 'FULL' });
        }
        setSelectedUsers(newSelected);
    };

    const handleContributionTypeChange = (userId: string, type: 'FULL' | 'HALF' | 'QUARTER') => {
        const newSelected = new Map(selectedUsers);
        const existing = newSelected.get(userId);
        if (existing) {
            newSelected.set(userId, { ...existing, contributionType: type });
            setSelectedUsers(newSelected);
        }
    };

    const handleAddMembers = async () => {
        try {
            setIsAdding(true);
            setError(null);

            const promises = Array.from(selectedUsers.values()).map(({ user, contributionType }) =>
                equbApi.createEqubMember({
                    equbId,
                    userId: user.id,
                    contributionType,
                })
            );

            await Promise.all(promises);
            onMembersAdded();
            handleClose();
        } catch (err) {
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Failed to add members');
        } finally {
            setIsAdding(false);
        }
    };

    const handleClose = () => {
        setSelectedUsers(new Map());
        setSearchQuery('');
        setError(null);
        onClose();
    };

    const availableUsers = users.filter(u => !existingMemberUserIds.includes(u.id));
    const selectedCount = selectedUsers.size;

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
            <IonContent>
                <div className="flex flex-col h-full bg-[#f5f8f8]">
                    {/* Header */}
                    <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-[#101818]">Add Members</h2>
                            <p className="text-sm text-[#5e8d8d]">to {equbName}</p>
                        </div>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <IonIcon icon={close} className="text-2xl text-[#101818]" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 bg-white border-b border-gray-200">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IonIcon icon={search} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#007f80]/20 placeholder-gray-400 text-[#101818]"
                                style={{ color: '#101818' }}
                                placeholder="Search by name or phone..."
                            />
                        </div>
                    </div>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <IonSpinner color="primary" />
                            </div>
                        ) : availableUsers.length > 0 ? (
                            <div className="space-y-2">
                                {availableUsers.map((user) => {
                                    const isSelected = selectedUsers.has(user.id);
                                    const selectedData = selectedUsers.get(user.id);

                                    return (
                                        <div
                                            key={user.id}
                                            className={`bg-white rounded-xl p-4 border-2 transition-all ${isSelected ? 'border-[#007f80]' : 'border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        onClick={() => handleUserToggle(user)}
                                                        className="cursor-pointer"
                                                    >
                                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-[#007f80] border-[#007f80]' : 'border-gray-300'
                                                            }`}>
                                                            {isSelected && (
                                                                <IonIcon icon={checkmarkCircle} className="text-white text-sm" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-10 h-10 rounded-full bg-[#007f80]/10 flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={`https://i.pravatar.cc/150?u=${user.id}`}
                                                                alt={user.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#101818]">{user.name}</p>
                                                            <p className="text-sm text-[#5e8d8d]">{user.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <p className="text-xs font-bold text-[#5e8d8d] uppercase mb-2">Contribution Type</p>
                                                    <div className="flex gap-2">
                                                        {(['FULL', 'HALF', 'QUARTER'] as const).map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => handleContributionTypeChange(user.id, type)}
                                                                className={`flex-1 flex items-center justify-center rounded-[50px] min-h-[40px] px-4 text-sm font-medium transition-colors whitespace-nowrap ${selectedData?.contributionType === type
                                                                    ? 'bg-[#008080] text-white shadow-sm'
                                                                    : 'bg-[#F4F5F8] text-[#608A8A] hover:bg-gray-200 hover:text-gray-700'
                                                                    }`}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-gray-400">
                                    {searchQuery ? 'No users found' : 'All users are already members'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="bg-white p-6 border-t border-gray-100">
                        <div className="flex gap-4">
                            <button
                                onClick={handleClose}
                                className="flex items-center justify-center bg-transparent border-2 border-equb-primary text-equb-primary font-bold rounded-full h-12 px-6 transition-all active:scale-[0.98] active:bg-equb-primary/5 flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMembers}
                                disabled={selectedCount === 0 || isAdding}
                                className="flex items-center justify-center bg-equb-primary text-white font-black rounded-full h-12 px-6 transition-all shadow-lg active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex-1 gap-2"
                            >
                                {isAdding ? (
                                    <>
                                        <IonSpinner name="crescent" color="light" className="w-5 h-5" />
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <span>Add {selectedCount} Member{selectedCount !== 1 ? 's' : ''}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default AddMembersModal;
