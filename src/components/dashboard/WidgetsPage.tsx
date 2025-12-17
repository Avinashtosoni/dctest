import {
    Activity,
    Users,
    HardDrive,
    TrendingUp,
    Calendar as CalendarIcon,
    Clock,
    MoreHorizontal,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    Bell,
    Music,
    Wifi
} from 'lucide-react';

export default function WidgetsPage() {
    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Widgets Gallery</h1>
                    <p className="text-gray-500 text-sm mt-1">A collection of responsive dashboard components and utilities.</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">v1.0.0</span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Stable</span>
                </div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* Widget 1: Storage Status - Compact */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <HardDrive size={24} />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">75% Used</h3>
                        <p className="text-sm text-gray-500 mb-4">150GB of 200GB</p>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full w-3/4 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Widget 2: Weekly Revenue - Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <div className="text-green-600 flex items-center text-sm font-semibold bg-green-50 px-2 py-0.5 rounded-lg">
                            <ArrowUpRight size={14} className="mr-1" /> +12.5%
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-2xl">$8,420</h3>
                        <p className="text-sm text-gray-500">Weekly Revenue</p>
                    </div>
                </div>

                {/* Widget 3: Profile Card - Central */}
                <div className="bg-gradient-to-br from-[#01478c] to-blue-700 p-6 rounded-2xl shadow-lg shadow-blue-500/30 text-white flex flex-col items-center justify-center text-center col-span-1 md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-4 border-white/20 shadow-xl mb-4 relative z-10"
                    />
                    <h3 className="text-xl font-bold relative z-10">Alex Johnson</h3>
                    <p className="text-white/80 text-sm mb-4 relative z-10">Senior Administrator</p>
                    <div className="flex gap-4 relative z-10">
                        <div className="text-center">
                            <span className="block font-bold text-lg">142</span>
                            <span className="text-xs text-white/60 uppercase">Projects</span>
                        </div>
                        <div className="w-px bg-white/20"></div>
                        <div className="text-center">
                            <span className="block font-bold text-lg">3.5k</span>
                            <span className="text-xs text-white/60 uppercase">Followers</span>
                        </div>
                    </div>
                </div>

                {/* Widget 4: Recent Activity - List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 md:col-span-1 lg:col-span-2 row-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={20} className="text-blue-500" /> Recent Activity
                        </h3>
                        <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: 'New project created', time: '2 mins ago', icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
                            { title: 'Server warning alert', time: '1 hour ago', icon: AlertCircle, color: 'text-red-500 bg-red-50' },
                            { title: 'New user registered', time: '3 hours ago', icon: Users, color: 'text-blue-500 bg-blue-50' },
                            { title: 'System update completed', time: '5 hours ago', icon: Clock, color: 'text-purple-500 bg-purple-50' },
                            { title: 'Database backup', time: '1 day ago', icon: HardDrive, color: 'text-orange-500 bg-orange-50' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-center group">
                                <div className={`p-2 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-800">{item.title}</h4>
                                    <p className="text-xs text-gray-500">{item.time}</p>
                                </div>
                                <button className="text-gray-300 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Widget 5: Calendar - Mini */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">December</h3>
                        <CalendarIcon size={18} className="text-gray-400" />
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2 font-medium">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-sm font-medium">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <div
                                key={d}
                                className={`aspect-square flex items-center justify-center rounded-lg ${d === 15 ? 'bg-blue-600 text-white shadow-md shadow-blue-300' :
                                    d === 25 ? 'bg-red-50 text-red-600' :
                                        'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Widget 6: Team Members - Avatars */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 md:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-indigo-500" /> Team Members
                        </h3>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <MoreHorizontal size={16} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="flex -space-x-4 overflow-hidden mb-6 pl-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <img
                                key={i}
                                className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                                src={`https://images.unsplash.com/photo-${1500 + i}?auto=format&fit=crop&q=80&w=100`}
                                alt=""
                            />
                        ))}
                        <div className="flex items-center justify-center h-12 w-12 rounded-full ring-2 ring-white bg-gray-100 text-xs font-bold text-gray-600">
                            +5
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors">Manage Team</button>
                        <button className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Add Member</button>
                    </div>
                </div>

                {/* Widget 7: System Health */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-gray-500">CPU Usage</span>
                                <span className="text-blue-600">45%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full w-[45%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-gray-500">Memory</span>
                                <span className="text-purple-600">62%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full">
                                <div className="h-full bg-purple-500 rounded-full w-[62%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-gray-500">Network</span>
                                <span className="text-green-600">Good</span>
                            </div>
                            <div className="flex gap-1 h-1.5 ">
                                <div className="flex-1 bg-green-500 rounded-full"></div>
                                <div className="flex-1 bg-green-500 rounded-full"></div>
                                <div className="flex-1 bg-green-500 rounded-full"></div>
                                <div className="flex-1 bg-gray-100 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Widget 8: Notification Panel */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Bell size={20} className="text-yellow-400" />
                        </div>
                        <span className="text-xs bg-red-500 px-2 py-0.5 rounded text-white font-bold">3 New</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Notifications</h3>
                    <p className="text-gray-400 text-sm mb-4">You have 3 unread messages.</p>
                    <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm font-semibold transition-colors">
                        View All
                    </button>
                </div>

                {/* Widget 9: Quick Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 md:col-span-1">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Settings</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Wi-Fi', icon: Wifi, on: true },
                            { label: 'Do Not Disturb', icon: Bell, on: false },
                            { label: 'Media Sound', icon: Music, on: true }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${s.on ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <s.icon size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{s.label}</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${s.on ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${s.on ? 'translate-x-4' : ''}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
