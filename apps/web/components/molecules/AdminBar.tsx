'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { LogIn, LogOut, User, LayoutDashboard, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { cn } from '@repo/ui';
import ThemeToggle from '../atoms/ThemeToggle';
import { createUserClient } from '@repo/database/client';
import { useRouter } from 'next/navigation';

interface AdminBarProps {
  className?: string;
}

export const AdminBar = ({ className }: AdminBarProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeForm, setActiveForm] = useState<'login' | 'register' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [isRegSubmitting, setIsRegSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [supabase] = useState(() => createUserClient());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveForm(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginSubmitting(true);
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError("Identifiants incorrects.");
      setIsLoginSubmitting(false);
    } else {
      setActiveForm(null);
      setLoginEmail('');
      setLoginPassword('');
      setIsLoginSubmitting(false);
      router.refresh();
    }
  };

  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegSubmitting(true);
    setRegError('');
    setRegSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Les mots de passe ne correspondent pas.');
      setIsRegSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });

    if (error) {
      setRegError(error.message || "Erreur lors de l'inscription.");
      setIsRegSubmitting(false);
    } else {
      setRegSuccessMsg("Compte créé avec succès !");
      setIsRegSubmitting(false);
      setTimeout(() => {
        setActiveForm('login');
        setRegSuccessMsg('');
      }, 1500);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className={cn("flex items-center justify-end gap-1.5", className)}>
        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-1.5">
                {/* Icône Profil Utilisateur */}
                <div 
                  className="p-2 text-foreground bg-secondary/60 rounded-md border border-border/60 flex items-center justify-center"
                  title={user.email}
                >
                  <User className="w-4 h-4 text-shop-orange" />
                </div>

                {/* Accès Dashboard */}
                <Link
                  href="/dashboard"
                  className="p-2 bg-shop-orange text-white hover:bg-shop-orange/90 rounded-md transition-colors shadow-xs flex items-center justify-center"
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-foreground hover:bg-secondary rounded-md transition-colors cursor-pointer border border-transparent hover:border-border/40 flex items-center justify-center"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* Icône Connexion */}
                <button
                  onClick={() => setActiveForm(activeForm === 'login' ? null : 'login')}
                  className={cn(
                    "p-2 rounded-md transition-colors cursor-pointer border flex items-center justify-center",
                    activeForm === 'login' 
                      ? "bg-secondary border-border text-foreground" 
                      : "bg-transparent border-transparent text-foreground hover:bg-secondary/70 hover:border-border/40"
                  )}
                  title="Connexion"
                >
                  <LogIn className="w-4 h-4 text-shop-orange" />
                </button>

                {/* Icône Inscription */}
                <button
                  onClick={() => setActiveForm(activeForm === 'register' ? null : 'register')}
                  className={cn(
                    "p-2 rounded-md transition-colors cursor-pointer border shadow-xs flex items-center justify-center",
                    activeForm === 'register'
                      ? "bg-shop-dark-green text-white border-transparent"
                      : "bg-shop-dark-green hover:bg-shop-dark-green/90 text-white border-transparent"
                  )}
                  title="S'inscrire"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
        
        <ThemeToggle />
      </div>

      {/* Popover / Bandeau déroulant sous les icônes */}
      {activeForm && !user && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 p-4 bg-background border border-border/80 rounded-xl shadow-2xl z-50 flex flex-col gap-3 backdrop-blur-md animate-in fade-in-50 slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <button
              onClick={() => setActiveForm(null)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Fermer</span>
            </button>
            <span className="text-xs font-bold text-foreground">
              {activeForm === 'login' ? 'Connexion rapide' : 'Créer un compte'}
            </span>
          </div>

          {/* Formulaire Connexion */}
          {activeForm === 'login' && (
            <div className="flex flex-col gap-3">
              {loginError && (
                <div className="p-2 bg-red-500/15 border border-red-500/30 text-red-500 text-xs rounded-lg font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleInlineLogin} className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-medium text-foreground">Mot de passe</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 pr-9 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  title='conn'
                  disabled={isLoginSubmitting}
                  className="w-full py-2 mt-1 bg-shop-orange hover:bg-shop-orange/90 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isLoginSubmitting ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <div className="text-center pt-1 text-xs text-muted-foreground">
                Pas de compte ?{' '}
                <button
                  onClick={() => setActiveForm('register')}
                  className="text-shop-orange font-semibold hover:underline cursor-pointer"
                >
                  S'inscrire
                </button>
              </div>
            </div>
          )}

          {/* Formulaire Inscription */}
          {activeForm === 'register' && (
            <div className="flex flex-col gap-3">
              {regError && (
                <div className="p-2 bg-red-500/15 border border-red-500/30 text-red-500 text-xs rounded-lg font-medium">
                  {regError}
                </div>
              )}

              {regSuccessMsg && (
                <div className="p-2 bg-green-500/15 border border-green-500/30 text-green-600 text-xs rounded-lg font-medium">
                  {regSuccessMsg}
                </div>
              )}

              <form onSubmit={handleInlineRegister} className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-dark-green/50"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-medium text-foreground">Mot de passe</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 pr-9 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-dark-green/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-medium text-foreground">Confirmer le mot de passe</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 pr-9 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-shop-dark-green/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegSubmitting}
                  className="w-full py-2 mt-1 bg-shop-dark-green hover:bg-shop-dark-green/90 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isRegSubmitting ? 'Création...' : 'S\'inscrire'}
                </button>
              </form>

              <div className="text-center pt-1 text-xs text-muted-foreground">
                Déjà un compte ?{' '}
                <button
                  onClick={() => setActiveForm('login')}
                  className="text-shop-dark-green font-semibold hover:underline cursor-pointer"
                >
                  Se connecter
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminBar;