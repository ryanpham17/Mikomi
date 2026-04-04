import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Manga = () => {
    return (
        <div>
            <Navbar relative={true} />
            <div className="bg-black w-full min-h-screen font-body">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-2xl font-bold text-white">Manga</h1>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Manga;