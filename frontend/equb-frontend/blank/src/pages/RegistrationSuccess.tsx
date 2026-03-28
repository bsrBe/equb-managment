// import { IonContent, IonPage, IonIcon } from '@ionic/react';
// import { checkmarkCircle, personAdd } from 'ionicons/icons';
// import { useHistory, useLocation } from 'react-router-dom';

// interface LocationState {
//     member: {
//         name: string;
//         id: string;
//     }
// }

// const RegistrationSuccess: React.FC = () => {
//     const history = useHistory();
//     const location = useLocation<LocationState>();
//     const memberName = location.state?.member?.name || 'John Doe';
//     const memberId = location.state?.member?.id || 'EQB-2023-042';
//     const joinDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());

//     return (
//         <IonPage>
//             <IonContent fullscreen>
//                 <div className="relative flex h-full min-h-screen w-full flex-col bg-[#f5f8f8] overflow-x-hidden font-sans text-[#111818]">
//                     {/* Top App Bar (Minimalist) */}
//                     <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm">
//                         <div className="size-12"></div>
//                         <h2 className="text-[#101818] text-lg font-bold leading-tight tracking-tight flex-1 text-center font-sans">
//                             Member Added
//                         </h2>
//                         <div className="size-12"></div>
//                     </div>

//                     {/* Success Content */}
//                     <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
//                         {/* Elegant Teal Checkmark Icon */}
//                         <div className="mb-10 flex items-center justify-center animate-in zoom-in duration-500">
//                             <div className="w-28 h-28 rounded-full bg-[#007f80]/10 flex items-center justify-center border-4 border-white shadow-lg">
//                                 <IonIcon icon={checkmarkCircle} className="text-7xl text-[#007f80]" />
//                             </div>
//                         </div>

//                         {/* Headline Text */}
//                         <h2 className="text-[#101818] tracking-tight text-3xl font-extrabold leading-tight text-center pb-4 px-4">
//                             Registration Success!
//                         </h2>

//                         {/* Body Text */}
//                         <p className="text-[#608a8a] text-lg font-medium leading-relaxed pb-12 text-center max-w-[340px]">
//                             {memberName} is now a member of the EqubDigital community.
//                         </p>

//                         {/* Member Detail Card - Premium Design */}
//                         <div className="w-full bg-white rounded-3xl p-8 border border-[#dae7e7] shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
//                             {/* Subtle background detail */}
//                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#007f80]/5 rounded-full -mr-16 -mt-16"></div>

//                             <div className="grid grid-cols-[45%_1fr] gap-y-7 relative z-10">
//                                 <div className="flex flex-col items-center justify-center text-center w-full">
//                                     <p className="text-[#a1bebe] text-[10px] font-bold uppercase tracking-[0.15em]">
//                                         Member Name
//                                     </p>
//                                     <p className="text-[#101818] text-xl font-bold mt-1.5">
//                                         {memberName}
//                                     </p>
//                                 </div>
//                                 {/* <div className="flex flex-col text-right">
//                                     <p className="text-[#a1bebe] text-[10px] font-bold uppercase tracking-[0.15em]">Member ID</p>
//                                     <p className="text-[#007f80] text-lg font-mono font-bold mt-1.5">{member}</p>
//                                 </div> */}
//                                 <div className="col-span-2 border-t border-gray-100 my-2"></div>
//                                 <div className="flex flex-col">
//                                     <p className="text-[#a1bebe] text-[10px] font-bold uppercase tracking-[0.15em]">Join Date</p>
//                                     <p className="text-[#101818] text-base font-bold mt-1.5">{joinDate}</p>
//                                 </div>
//                                 <div className="flex flex-col text-right">
//                                     <p className="text-[#a1bebe] text-[10px] font-bold uppercase tracking-[0.15em]">Status</p>
//                                     <div className="flex justify-end mt-1.5">
//                                         <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-1.5 text-xs font-extrabold text-green-700 border border-green-100 shadow-sm uppercase tracking-wider">
//                                             Active
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Sticky Bottom Actions */}
//                     <div className="p-8 bg-white space-y-4 border-t border-gray-100">
//                         {/* Primary Button: Back to Directory */}
//                         <button
//                             onClick={() => history.push('/members')}
//                             /* Updated height to h-14, rounded to !rounded-2xl, and added the teal shadow glow */
//                             className="w-full h-14 bg-[#008080] hover:bg-[#006666] text-white text-lg font-bold !rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,128,128,0.4)] active:scale-[0.97] transition-all flex items-center justify-center"
//                             style={{ borderRadius: '16px' }} // Consistency fix for Ionic
//                         >
//                             Back to Directory
//                         </button>

//                         {/* Secondary Button: Add Another Member */}
//                         <button
//                             onClick={() => history.push('/register-member')}
//                             /* Updated height to h-14 and rounded to !rounded-2xl to match the primary button */
//                             className="w-full h-14 bg-transparent text-[#101818] text-lg font-bold !rounded-2xl border-2 border-[#dae7e7] hover:bg-[#f5f8f8] active:scale-[0.97] transition-all flex items-center justify-center gap-3"
//                             style={{ borderRadius: '16px' }} // Consistency fix for Ionic
//                         >
//                             <IonIcon icon={personAdd} className="text-[#008080] text-2xl" />
//                             <span>Add Another Member</span>
//                         </button>
//                     </div>

//                     {/* iOS Indicator Spacer */}
//                     <div className="h-6"></div>
//                 </div>
//             </IonContent>
//         </IonPage>
//     );
// };

// export default RegistrationSuccess;
import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { checkmarkCircle, personAdd } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';

interface LocationState {
    member: {
        name: string;
        id: string;
    }
}

const RegistrationSuccess: React.FC = () => {
    const history = useHistory();
    const location = useLocation<LocationState>();
    const memberName = location.state?.member?.name || 'John Doe';
    const joinDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());

    return (
        <IonPage>
            {/* scrollY={false} prevents the bounce and scrolling in Ionic */}
            <IonContent fullscreen scrollY={false}>
                <div className="flex h-full w-full flex-col bg-[#f5f8f8] overflow-hidden font-sans text-[#111818]">

                    {/* Top App Bar */}
                    <div className="flex items-center bg-white p-4 justify-between border-b border-gray-100 shadow-sm">
                        <div className="size-12"></div>
                        <h2 className="text-[#101818] text-lg font-bold flex-1 text-center">
                            Member Added
                        </h2>
                        <div className="size-12"></div>
                    </div>

                    {/* Success Content - flex-1 takes remaining space */}
                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">

                        {/* Compact Icon */}
                        <div className="mb-6 flex items-center justify-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-full bg-[#007f80]/10 flex items-center justify-center border-4 border-white shadow-md">
                                <IonIcon icon={checkmarkCircle} className="text-5xl text-[#007f80]" />
                            </div>
                        </div>

                        {/* Headline Text */}
                        <h2 className="text-[#101818] tracking-tight text-2xl font-extrabold text-center pb-2">
                            Registration Success!
                        </h2>

                        {/* Body Text */}
                        <p className="text-[#608a8a] text-base font-medium text-center pb-6 max-w-[280px]">
                            {memberName} is now a member of the community.
                        </p>

                        {/* Member Detail Card */}
                        <div className="w-full bg-white rounded-3xl p-6 border border-[#dae7e7] shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#007f80]/5 rounded-full -mr-12 -mt-12"></div>

                            <div className="grid grid-cols-2 gap-y-5 relative z-10">
                                {/* CENTERING FIX: col-span-2 ensures it's centered relative to the whole card */}
                                <div className="col-span-2 flex flex-col items-center justify-center text-center py-2">
                                    <p className="text-[#a1bebe] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                                        Member Name
                                    </p>
                                    <p className="text-[#101818] text-2xl font-bold">
                                        {memberName}
                                    </p>
                                </div>

                                <div className="col-span-2 border-t border-gray-50 my-1"></div>

                                <div className="flex flex-col">
                                    <p className="text-[#a1bebe] text-[10px] font-bold uppercase tracking-[0.15em]">Join Date</p>
                                    <p className="text-[#101818] text-base font-bold mt-1">{joinDate}</p>
                                </div>
                                <div className="flex flex-col text-right">
                                    <p className="text-[#a1bebe] text-[10px] font-bold uppercase tracking-[0.15em]">Status</p>
                                    <div className="flex justify-end mt-1">
                                        <span className="inline-flex items-center rounded-lg bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700 border border-green-100 uppercase tracking-wider">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions - Reduced padding to save space */}
                    <div className="p-6 bg-white space-y-3 border-t border-gray-100">
                        <button
                            onClick={() => history.push('/members')}
                            className="w-full h-14 bg-[#008080] text-white text-lg font-bold !rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,128,128,0.4)] active:scale-[0.97] transition-all flex items-center justify-center"
                            style={{ borderRadius: '16px' }}
                        >
                            Back to Directory
                        </button>

                        <button
                            onClick={() => history.push('/register-member')}
                            className="w-full h-14 bg-transparent text-[#101818] text-lg font-bold !rounded-2xl border-2 border-[#dae7e7] active:scale-[0.97] transition-all flex items-center justify-center gap-3"
                            style={{ borderRadius: '16px' }}
                        >
                            <IonIcon icon={personAdd} className="text-[#008080] text-xl" />
                            <span>Add Another Member</span>
                        </button>
                    </div>

                    {/* Minimal spacer for iOS home indicator */}
                    <div className="h-4 bg-white"></div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default RegistrationSuccess;