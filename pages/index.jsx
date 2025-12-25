import Layout from "./Layout.jsx";

import Analytics from "./Analytics";

import Community from "./Community";

import CustomerSupport from "./CustomerSupport";

import Game from "./Game";

import GuildRaidBoss from "./GuildRaidBoss";

import GuildRaids from "./GuildRaids";

import GuildWars from "./GuildWars";

import Guilds from "./Guilds";

import Home from "./Home";

import Leaderboards from "./Leaderboards";

import Loans from "./Loans";

import Options from "./Options";

import Portfolio from "./Portfolio";

import PrestigeBadges from "./PrestigeBadges";

import Profile from "./Profile";

import PvP from "./PvP";

import Shop from "./Shop";

import Social from "./Social";

import ThemeShop from "./ThemeShop";

import Trading from "./Trading";

import Wagers from "./Wagers";

import Work from "./Work";

import PvPSeasons from "./PvPSeasons";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Analytics: Analytics,
    
    Community: Community,
    
    CustomerSupport: CustomerSupport,
    
    Game: Game,
    
    GuildRaidBoss: GuildRaidBoss,
    
    GuildRaids: GuildRaids,
    
    GuildWars: GuildWars,
    
    Guilds: Guilds,
    
    Home: Home,
    
    Leaderboards: Leaderboards,
    
    Loans: Loans,
    
    Options: Options,
    
    Portfolio: Portfolio,
    
    PrestigeBadges: PrestigeBadges,
    
    Profile: Profile,
    
    PvP: PvP,
    
    Shop: Shop,
    
    Social: Social,
    
    ThemeShop: ThemeShop,
    
    Trading: Trading,
    
    Wagers: Wagers,
    
    Work: Work,
    
    PvPSeasons: PvPSeasons,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Analytics />} />
                
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Community" element={<Community />} />
                
                <Route path="/CustomerSupport" element={<CustomerSupport />} />
                
                <Route path="/Game" element={<Game />} />
                
                <Route path="/GuildRaidBoss" element={<GuildRaidBoss />} />
                
                <Route path="/GuildRaids" element={<GuildRaids />} />
                
                <Route path="/GuildWars" element={<GuildWars />} />
                
                <Route path="/Guilds" element={<Guilds />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Leaderboards" element={<Leaderboards />} />
                
                <Route path="/Loans" element={<Loans />} />
                
                <Route path="/Options" element={<Options />} />
                
                <Route path="/Portfolio" element={<Portfolio />} />
                
                <Route path="/PrestigeBadges" element={<PrestigeBadges />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/PvP" element={<PvP />} />
                
                <Route path="/Shop" element={<Shop />} />
                
                <Route path="/Social" element={<Social />} />
                
                <Route path="/ThemeShop" element={<ThemeShop />} />
                
                <Route path="/Trading" element={<Trading />} />
                
                <Route path="/Wagers" element={<Wagers />} />
                
                <Route path="/Work" element={<Work />} />
                
                <Route path="/PvPSeasons" element={<PvPSeasons />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}