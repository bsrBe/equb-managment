import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { constructOutline, arrowBackOutline, homeOutline } from 'ionicons/icons';

const NotFound: React.FC = () => {
    const history = useHistory();

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding">
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f8f8] px-6 text-center">
                    {/* Premium Illustration Placeholder */}
                    <div className="relative mb-8">
                        <div className="w-32 h-32 bg-[#007f80]/10 rounded-full flex items-center justify-center animate-pulse">
                            <IonIcon icon={constructOutline} className="text-6xl text-[#007f80]" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                            404
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-[#111818] mb-4">
                        Oops! Page Not Found
                    </h1>

                    <p className="text-[#608a8a] text-lg mb-10 max-w-xs mx-auto leading-relaxed">
                        We couldn't find the page you're looking for. It might have been moved or deleted.
                    </p>

                    <div className="flex flex-col w-full gap-4 max-w-xs">
                        <button
                            onClick={() => history.push('/dashboard')}
                            className="w-full h-14 bg-[#007f80] text-white font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,127,128,0.4)] flex items-center justify-center gap-3 active:scale-[0.97] transition-all"
                        >
                            <IonIcon icon={homeOutline} className="text-xl" />
                            Return to Dashboard
                        </button>

                        <button
                            onClick={() => history.goBack()}
                            className="w-full h-14 bg-white border border-[#dae7e7] text-[#111818] font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-[0.97] transition-all"
                        >
                            <IonIcon icon={arrowBackOutline} className="text-xl" />
                            Go Backward
                        </button>
                    </div>

                    <p className="mt-12 text-xs text-[#a1bebe] uppercase tracking-widest font-black">
                        EqubDigital Manager
                    </p>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default NotFound;
