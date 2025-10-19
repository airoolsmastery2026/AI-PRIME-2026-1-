import React from 'react';
import { YouTubeIcon } from '../components/icons/YouTubeIcon';
import { TikTokIcon } from '../components/icons/TikTokIcon';
import { InstagramIcon } from '../components/icons/InstagramIcon';
import { FacebookIcon } from '../components/icons/FacebookIcon';
import { XIcon } from '../components/icons/XIcon';
import { PinterestIcon } from '../components/icons/PinterestIcon';
import { LinkedInIcon } from '../components/icons/LinkedInIcon';
import { AmazonIcon } from '../components/icons/AmazonIcon';
import { ClickBankIcon } from '../components/icons/ClickBankIcon';
import { CJIcon } from '../components/icons/CJIcon';
import { ShareASaleIcon } from '../components/icons/ShareASaleIcon';
import { RakutenIcon } from '../components/icons/RakutenIcon';
import { BinanceIcon } from '../components/icons/BinanceIcon';
import { CoinbaseIcon } from '../components/icons/CoinbaseIcon';
import { LedgerIcon } from '../components/icons/LedgerIcon';
import { ServiceIcon } from '../components/icons/ServiceIcon';


export const getPlatformIcon = (platform: string, className = "w-5 h-5"): React.ReactNode => {
    switch(platform.toLowerCase()) {
        case 'youtube': return <YouTubeIcon className={className} />;
        case 'tiktok': return <TikTokIcon className={className} />;
        case 'instagram': return <InstagramIcon className={className} />;
        case 'facebook': return <FacebookIcon className={className} />;
        case 'x': return <XIcon className={className} />;
        case 'pinterest': return <PinterestIcon className={className} />;
        case 'linkedin': return <LinkedInIcon className={className} />;
        case 'amazon': return <AmazonIcon className={className} />;
        case 'clickbank': return <ClickBankIcon className={className} />;
        case 'cj': return <CJIcon className={className} />;
        case 'shareasale': return <ShareASaleIcon className={className} />;
        case 'rakuten': return <RakutenIcon className={className} />;
        case 'binance': return <BinanceIcon className={className} />;
        case 'coinbase': return <CoinbaseIcon className={className} />;
        case 'ledger': return <LedgerIcon className={className} />;
        default: return <ServiceIcon className={className}/>;
    }
};