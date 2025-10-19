import { ConnectablePlatform } from '../types';

export const getPlatformUrl = (platform: ConnectablePlatform, username: string): string => {
    switch (platform) {
        // Social
        case 'youtube':
            return `https://www.youtube.com/@${username}`;
        case 'tiktok':
            return `https://www.tiktok.com/@${username}`;
        case 'instagram':
            return `https://www.instagram.com/${username}`;
        case 'x':
            return `https://x.com/${username}`;
        case 'facebook':
            return `https://www.facebook.com/${username}`;
        case 'pinterest':
            return `https://www.pinterest.com/${username}`;
        case 'linkedin':
            return `https://www.linkedin.com/in/${username}`;

        // Affiliate General
        case 'clickbank':
            return 'https://login.clickbank.net/login';
        case 'amazon':
            return 'https://affiliate-program.amazon.com/';
        case 'cj':
            return 'https://junction.cj.com/auth/login';
        case 'shareasale':
            return 'https://account.shareasale.com/a-login.cfm';
        case 'rakuten':
            return 'https://rakutenadvertising.com/login/';

        // Affiliate Crypto
        case 'binance':
            return 'https://www.binance.com/en/login';
        case 'coinbase':
            return 'https://www.coinbase.com/login';
        case 'ledger':
            return 'https://www.ledger.com/';

        default:
            return '#'; // Fallback
    }
};
