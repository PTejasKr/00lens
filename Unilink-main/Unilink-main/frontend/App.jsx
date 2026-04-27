import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { PostProvider } from './context/PostContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Navigation from './components/Navigation';
import SplashScreen from './components/SplashScreen';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import PostDetail from './pages/PostDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRoute from './components/AdminRoute';

const MainLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-24 pb-16 flex gap-8 lg:gap-12">
            {/* Left Navigation */}
            <div className="hidden sm:block w-[64px] lg:w-[220px] shrink-0">
                <div className="sticky top-24">
                    <Navigation />
                </div>
            </div>
            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    </div>
);

const App = () => {
    const [splashDone, setSplashDone] = useState(false);

    return (
        <>
            {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}

            <Router>
                <AuthProvider>
                    <ChatProvider>
                        <PostProvider>
                            <div className="min-h-screen bg-cream">
                                <Routes>
                                    <Route path="/" element={
                                        <ProtectedRoute>
                                            <MainLayout><Dashboard /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/feed" element={
                                        <ProtectedRoute>
                                            <MainLayout><Dashboard /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />

                                    <Route path="/create" element={
                                        <ProtectedRoute>
                                            <MainLayout><CreatePost /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/profile" element={
                                        <ProtectedRoute>
                                            <MainLayout><Profile /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/profile/:id" element={
                                        <ProtectedRoute>
                                            <MainLayout><Profile /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/post/:id" element={
                                        <ProtectedRoute>
                                            <MainLayout><PostDetail /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/groups" element={
                                        <ProtectedRoute>
                                            <MainLayout><Groups /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/groups/:id" element={
                                        <ProtectedRoute>
                                            <MainLayout><GroupDetail /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/messages" element={
                                        <ProtectedRoute>
                                            <MainLayout><Chat /></MainLayout>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/admin/login" element={<AdminLogin />} />
                                    <Route path="/admin" element={
                                        <AdminRoute>
                                            <MainLayout><AdminDashboard /></MainLayout>
                                        </AdminRoute>
                                    } />
                                    <Route path="/admin/dashboard" element={
                                        <AdminRoute>
                                            <MainLayout><AdminDashboard /></MainLayout>
                                        </AdminRoute>
                                    } />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>

                                <ToastContainer
                                    position="bottom-right"
                                    autoClose={3500}
                                    hideProgressBar={false}
                                    closeOnClick
                                    pauseOnHover
                                    theme="light"
                                    toastClassName={() =>
                                        "relative flex p-4 min-h-14 rounded-2xl overflow-hidden cursor-pointer bg-white border border-rose/20 shadow-xl mb-3 font-body"
                                    }
                                    progressStyle={{ background: '#EE6983' }}
                                />
                            </div>
                        </PostProvider>
                    </ChatProvider>
                </AuthProvider>
            </Router>
        </>
    );
};

export default App;
