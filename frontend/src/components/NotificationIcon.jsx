import {
    Gavel, Handshake, BanknoteArrowUp, BanknoteArrowDown,
    MessageSquare, UserCheck, Shield, Bell,
} from 'lucide-react';

const categoryIcons = {
    auction: Gavel,
    offer: Handshake,
    payment: BanknoteArrowUp,
    payout: BanknoteArrowDown,
    communication: MessageSquare,
    account: UserCheck,
    moderation: Shield,
    system: Bell,
};

const priorityStyles = {
    low: 'text-gray-600 bg-gray-100',
    medium: 'text-blue-600 bg-blue-100',
    high: 'text-amber-700 bg-amber-100',
    urgent: 'text-red-600 bg-red-100',
};

export const NotificationIcon = ({ notification, size = 'md' }) => {
    const Icon = categoryIcons[notification?.category] || Bell;
    const style = priorityStyles[notification?.priority] || priorityStyles.medium;
    const dim = size === 'sm' ? 14 : size === 'lg' ? 22 : 18;
    const box = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
    return (
        <div className={`${box} rounded-full flex items-center justify-center flex-shrink-0 ${style}`}>
            <Icon size={dim} />
        </div>
    );
};

export const priorityBadgeClass = (priority) => {
    const map = {
        low: 'bg-gray-100 text-gray-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-amber-100 text-amber-800',
        urgent: 'bg-red-100 text-red-700',
    };
    return map[priority] || map.medium;
};

export const categoryLabel = (cat) => ({
    auction: 'Auctions',
    offer: 'Offers',
    payment: 'Payments',
    payout: 'Payouts',
    communication: 'Messages',
    account: 'Account',
    moderation: 'Moderation',
    system: 'System',
}[cat] || cat);