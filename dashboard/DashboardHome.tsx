import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { MoreVertical, DollarSign, RefreshCw, Briefcase, Activity } from 'lucide-react';
import StatsCard from './StatsCard';

// Dummy data for charts
const paymentData = [
    { name: 'JAN', val: 2400 }, { name: 'FEB', val: 1398 }, { name: 'MAR', val: 9800 },
    { name: 'APR', val: 3908 }, { name: 'MAY', val: 4800 }, { name: 'JUN', val: 3800 },
    { name: 'JUL', val: 4300 }, { name: 'AUG', val: 9800 }, { name: 'SEP', val: 3908 },
    { name: 'OCT', val: 4800 }, { name: 'NOV', val: 3800 }, { name: 'DEC', val: 4300 },
];

const salesData = [
    { name: 'A', uv: 4000 }, { name: 'B', uv: 3000 }, { name: 'C', uv: 2000 },
    { name: 'D', uv: 2780 }, { name: 'E', uv: 1890 }, { name: 'F', uv: 2390 }, { name: 'G', uv: 3490 },
];

const leadsData = [
    { name: 'New', value: 400, color: '#3b82f6' },
    { name: 'Contacted', value: 300, color: '#60a5fa' },
    { name: 'Qualified', value: 300, color: '#93c5fd' },
    { name: 'Working', value: 200, color: '#bfdbfe' },
];

const smallChartData = [
    { uv: 20 }, { uv: 40 }, { uv: 35 }, { uv: 50 }, { uv: 45 }, { uv: 60 }, { uv: 55 }
];

export default function DashboardHome() {
    return (
        <div className="space-y-6">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Invoices Awaiting Payment" value="45/76" subTitle="Invoices Awaiting" subValue="$5,569" subValueLabel="56%"
                    icon={<DollarSign size={20} />}
                />
                <StatsCard
                    title="Converted Leads" value="48/86" subTitle="Converted Leads" subValue="52 Completed" subValueLabel="63%"
                    icon={<RefreshCw size={20} />}
                />
                <StatsCard
                    title="Projects In Progress" value="16/20" subTitle="Projects In Progress" subValue="16 Completed" subValueLabel="76%"
                    icon={<Briefcase size={20} />}
                />
                <StatsCard
                    title="Conversion Rate" value="46.59%" subTitle="Conversion Rate" subValue="$2,254" subValueLabel="46%"
                    icon={<Activity size={20} />}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Record - Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Payment Record</h3>
                        <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paymentData} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="val" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Awaiting</p>
                            <p className="font-bold text-gray-900">$5,486</p>
                            <div className="h-1 w-full bg-blue-100 mt-2 rounded-full"><div className="h-full bg-blue-600 w-1/2 rounded-full"></div></div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Completed</p>
                            <p className="font-bold text-gray-900">$9,275</p>
                            <div className="h-1 w-full bg-green-100 mt-2 rounded-full"><div className="h-full bg-green-500 w-3/4 rounded-full"></div></div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Rejected</p>
                            <p className="font-bold text-gray-900">$3,868</p>
                            <div className="h-1 w-full bg-red-100 mt-2 rounded-full"><div className="h-full bg-red-500 w-1/4 rounded-full"></div></div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Revenue</p>
                            <p className="font-bold text-gray-900">$50,668</p>
                            <div className="h-1 w-full bg-black mt-2 rounded-full"><div className="h-full bg-black w-full rounded-full"></div></div>
                        </div>
                    </div>
                </div>

                {/* Total Sales - Area Chart Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 bg-blue-600 text-white relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-3xl font-bold">30,569</h3>
                                <p className="text-blue-100 text-sm">Total Sales</p>
                            </div>
                            <span className="bg-white/20 text-xs px-2 py-1 rounded">12%</span>
                        </div>
                        <div className="h-[120px] w-full -mb-6 -mx-6 mt-4 mix-blend-overlay opacity-50">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <Area type="monotone" dataKey="uv" stroke="#fff" fill="#fff" fillOpacity={0.4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="p-6 flex-grow space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center text-green-600">S</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Shopify eCommerce Store</p>
                                    <p className="text-xs text-gray-500">Electronics</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">$1200</p>
                                <p className="text-xs text-gray-500">5 sold</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">A</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">IOS Apps Development</p>
                                    <p className="text-xs text-gray-500">Electronics</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">$1450</p>
                                <p className="text-xs text-gray-500">3 sold</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center text-orange-600">F</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Figma Dashboard Design</p>
                                    <p className="text-xs text-gray-500">Electronics</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">$1250</p>
                                <p className="text-xs text-gray-500">3 sold</p>
                            </div>
                        </div>
                        <div className="pt-2 text-center">
                            <button className="text-xs font-bold text-gray-500 uppercase">Full Details</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Small Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Tasks Completed', val: '22/35', sub: '22/35 completed', color: '#6366f1' },
                    { title: 'New Tasks', val: '5/20', sub: '5/20 completed', color: '#10b981' },
                    { title: 'Project Done', val: '20/30', sub: '20/30 completed', color: '#ef4444' }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 text-gray-500 mb-1">
                                <Activity size={16} />
                                <span className="text-sm font-medium">{item.title}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{item.sub}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.val}</h3>
                            <div className="h-10 w-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={smallChartData}>
                                        <Area type="monotone" dataKey="uv" stroke={item.color} fill={item.color} fillOpacity={0.2} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Leads & Table Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leads Overview */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-full flex justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Leads Overview</h3>
                        <MoreVertical size={16} className="text-gray-400" />
                    </div>
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadsData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {leadsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full text-xs mt-4">
                        {leadsData.map((d, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-gray-600">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Leads Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Latest Leads</h3>
                        <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                    <th className="pb-3 font-medium">Users</th>
                                    <th className="pb-3 font-medium">Proposal</th>
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { name: 'Archie Cantones', email: 'archie.tones@gmail.com', status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
                                    { name: 'Holmes Cherryman', email: 'golms.chan@gmail.com', status: 'In Progress', statusColor: 'text-blue-600 bg-blue-50' },
                                    { name: 'Malanie Hanvey', email: 'lanie.nveyn@gmail.com', status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
                                    { name: 'Kenneth Hune', email: 'nneth.une@gmail.com', status: 'Not Interested', statusColor: 'text-orange-600 bg-orange-50' },
                                    { name: 'Valentine Maton', email: 'alentine.aton@gmail.com', status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
                                ].map((lead, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="py-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{lead.name}</p>
                                                    <p className="text-xs text-gray-500">{lead.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Sent</span></td>
                                        <td className="py-3 text-gray-500 text-xs">11/06/2023 10:53</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${lead.statusColor}`}>{lead.status}</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
