import React from 'react';
import { Navigation } from '../components/navigation';
import '../styles/globals.css';

const Layout = ({ children }) => {
    return (
        <div>
            <header>
                <h1>Narrativas Chronoscribe</h1>
                <Navigation />
            </header>
            <main>{children}</main>
            <footer>
                <p>&copy; {new Date().getFullYear()} Narrativas Chronoscribe. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;