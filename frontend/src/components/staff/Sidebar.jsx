import {
    LayoutDashboard,
    LogOut,
    Users,
    Gavel,
    Shield,
    Settings,
    BarChart3,
    FileText,
    Flag,
    MessageSquare,
    CreditCard,
    Building,
    Award,
    Bell,
    X,
    Menu,
    Package,
    TrendingUp,
    UserCheck,
    DollarSign,
    UserCircle,
    MessageCircle,
    Hand,
    Tags,
    PoundSterling,
    Banknote,
    BanknoteArrowDown,
    BanknoteArrowUp,
    Video,
    UserPlus,
    Handshake,
    CalendarDaysIcon,
    ShieldUser,
    Store,
    Briefcase,
    PercentCircleIcon
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logo } from "../../assets";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";

// Define navigation with permissions
const allNavigation = [
    {
        name: 'Dashboard',
        path: '/staff/dashboard',
        icon: <LayoutDashboard size={20} />,
        permission: 'view_dashboard'
    },
    {
        name: 'Users',
        path: '/staff/users',
        icon: <Users size={20} />,
        permission: 'manage_users'
    },
    {
        name: 'Staff',
        path: '/staff/staff',
        icon: <ShieldUser size={20} />,
        permission: 'manage_admins'
    },
    {
        name: 'Auctions',
        path: '/staff/auctions/all',
        icon: <Gavel size={20} />,
        permission: 'manage_auctions'
    },
    {
        name: 'Events',
        path: '/staff/events/all',
        icon: <CalendarDaysIcon size={20} />,
        permission: "manage_events"
    },
    {
        name: 'Bids',
        path: '/staff/bids',
        icon: <Hand size={20} />,
        permission: 'manage_bids'
    },
    {
        name: 'Offers',
        path: '/staff/offers',
        icon: <Handshake size={20} />,
        permission: 'manage_offers'
    },
    {
        name: 'Liquidations',
        path: '/staff/liquidation-requests',
        icon: <Store size={20} />,
        permission: 'manage_liquidations'
    },
    {
        name: 'Consultations',
        path: '/staff/sell-requests',
        icon: <Briefcase size={20} />,
        permission: 'manage_sell_requests'
    },
    {
        name: 'Communications',
        path: '/staff/communications/all',
        icon: <MessageSquare size={20} />,
        permission: 'manage_communications'
    },
    {
        name: 'Categories',
        path: '/staff/categories',
        icon: <Tags size={20} />,
        permission: 'manage_categories'
    },
    {
        name: 'Buyer Payments',
        path: '/staff/transactions',
        icon: <BanknoteArrowUp size={20} />,
        permission: 'manage_transactions'
    },
    {
        name: 'Seller Payouts',
        path: '/staff/payouts',
        icon: <BanknoteArrowDown size={20} />,
        permission: 'manage_payouts'
    },
    {
        name: 'Commissions',
        path: '/staff/commissions',
        icon: <Settings size={20} />,
        permission: 'manage_commissions'
    },
    {
        name: 'Tax Settings',
        path: '/staff/tax-settings',
        icon: <PercentCircleIcon size={20} />,
        permission: 'manage_tax'
    },
    {
        name: 'Comments',
        path: '/staff/comments',
        icon: <MessageCircle size={20} />,
        permission: 'manage_comments'
    },
    {
        name: 'Support',
        path: '/staff/support/inquiries',
        icon: <MessageSquare size={20} />,
        permission: 'manage_inquiries'
    },
    {
        name: 'Profile',
        path: '/staff/profile',
        icon: <UserCircle size={20} />,
        permission: null
    }
];

function Sidebar() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [expandedMenus, setExpandedMenus] = useState([]);
    const { logout, user } = useAuth();
    const { permissions, loading: permissionsLoading, isAdmin } = usePermissions();

    // Filter navigation based on permissions (use permissions from hook, not user)
    const navigation = allNavigation.filter(item => {
        if (item.path === '/staff/profile') return true;
        if (!item.permission) return true;
        if (isAdmin) return true;
        return permissions.includes(item.permission);
    });

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scrolling when sidebar is open on mobile
    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isMobile]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    const toggleSubmenu = (menuName) => {
        setExpandedMenus(prev =>
            prev.includes(menuName)
                ? prev.filter(name => name !== menuName)
                : [...prev, menuName]
        );
    };

    const isMenuExpanded = (menuName) => expandedMenus.includes(menuName);

    // Get role display text
    const getRoleDisplay = () => {
        if (isAdmin) return { title: "Administrator", description: "Full System Access", bgColor: "bg-white", textColor: "text-black", badgeColor: "text-primary" };
        if (user?.userType === 'staff') return { title: "Staff Member", description: "Limited Access", bgColor: "bg-blue-900", textColor: "text-white", badgeColor: "text-blue-300" };
        return { title: "Admin", description: "System Access", bgColor: "bg-white", textColor: "text-black", badgeColor: "text-primary" };
    };

    const role = getRoleDisplay();

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={toggleSidebar}
                className={`md:hidden ${isOpen && isMobile ? 'hidden' : 'fixed'} top-4 left-4 z-30 sm:z-40 p-2 rounded-md bg-primary text-pure-white`}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-[#1e2d3b] bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative w-64 bg-[#080A0D] text-white
                h-dvh md:h-auto md:min-h-screen
                flex flex-col z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* ── Fixed top: logo + close + role badge ── */}
                <div className="shrink-0 px-4 pt-4">
                    <div className="px-4 mb-4 flex items-center justify-between pb-2 border-b border-gray-700">
                        <Link to='/' className="flex items-center gap-2">
                            <img src={logo} alt="logo" className="h-12 md:h-14" />
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="px-4 mb-4">
                        <div className={`${role.bgColor} ${role.textColor} rounded-lg p-3 text-center`}>
                            <div className="flex items-center justify-center gap-2">
                                <Shield size={16} />
                                <span className="text-sm font-medium">{role.title}</span>
                            </div>
                            <p className="text-xs mt-1 opacity-70">{role.description}</p>
                        </div>
                    </div>
                </div>

                {/* ── Scrollable middle: nav links ── */}
                <nav className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 [-webkit-overflow-scrolling:touch]">
                    <ul className="space-y-1">
                        {navigation.map((link) => (
                            <li key={link.name}>
                                {link.submenu ? (
                                    <div>
                                        <button
                                            onClick={() => toggleSubmenu(link.name)}
                                            className={`flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200 hover:bg-white hover:text-black ${isMenuExpanded(link.name) ? 'bg-white text-black' : ''
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-3">{link.icon}</span>
                                                <span>{link.name}</span>
                                            </div>
                                            <svg
                                                className={`w-4 h-4 transition-transform duration-200 ${isMenuExpanded(link.name) ? 'rotate-180' : ''
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {isMenuExpanded(link.name) && (
                                            <ul className="ml-6 mt-1 space-y-1">
                                                {link.submenu.map((subItem) => (
                                                    <li key={subItem.name}>
                                                        <NavLink
                                                            to={subItem.path}
                                                            onClick={() => isMobile && setIsOpen(false)}
                                                            className={({ isActive }) =>
                                                                `flex items-center p-2 rounded-lg text-sm transition-all duration-200 ${isActive
                                                                    ? 'bg-gray-800 text-white'
                                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                                }`
                                                            }
                                                        >
                                                            <span className="ml-2">{subItem.name}</span>
                                                        </NavLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        to={link.path}
                                        onClick={() => isMobile && setIsOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center p-3 rounded-lg transition-all duration-200 ${isActive
                                                ? 'bg-[#F5B51B] text-black shadow-lg shadow-[#F5B51B]/20'
                                                : 'text-white hover:bg-[#F5B51B]/90 hover:text-black'
                                            }`
                                        }
                                    >
                                        <span className="mr-3">{link.icon}</span>
                                        <span>{link.name}</span>
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* ── Fixed bottom: Logout ── */}
                <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 border-t border-gray-700">
                    <button
                        onClick={logout}
                        className="flex items-center w-full p-3 rounded-lg text-white hover:bg-red-600 transition-all duration-200"
                    >
                        <LogOut size={20} className="mr-3" />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;