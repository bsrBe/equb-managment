import { IonIcon } from '@ionic/react';
import { search } from 'ionicons/icons';

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search your Equbs',
    value = '',
    onChange
}) => {
    return (
        <div className="relative mx-4 my-4">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <IonIcon icon={search} className="text-xl text-gray-400" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-equb-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-equb-primary focus:bg-white transition-all"
            />
        </div>
    );
};

export default SearchBar;
