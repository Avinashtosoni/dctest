import { MoreVertical } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    subTitle: string;
    subValue: string;
    subValueLabel?: string;
    icon?: React.ReactNode;
}

export default function StatsCard({ title, value, subTitle, subValue, subValueLabel, icon }: StatsCardProps) {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    {icon && (
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                </button>
            </div>

            <div className="border-t border-gray-100 pt-3 mt-auto">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{subTitle}</span>
                    <div className="flex items-center space-x-1">
                        <span className="font-semibold text-gray-900">{subValue}</span>
                        {subValueLabel && <span className="text-gray-400">({subValueLabel})</span>}
                    </div>
                </div>
                {/* Progress bar simulation if needed, adding specific color line at bottom */}
                <div className="w-full h-1 bg-gray-100 mt-3 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
            </div>
        </div>
    );
}
