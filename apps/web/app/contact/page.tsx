'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ArrowLeft, MessageSquare, Building2, User } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // État du type de profil (particulier ou professionnel)
  const [profileType, setProfileType] = useState<'particulier' | 'professionnel'>('particulier');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Champs spécifiques professionnels
    companyName: '',
    businessActivity: 'restaurant',
    companyAddress: '',
    companyPhone: '',
    // Champs communs
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation d'un envoi d'email
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Navigation & Fil d'Ariane */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-shop-orange transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Retour à l'accueil
          </Link>
        </div>

        {/* En-tête de la page */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-shop-orange bg-shop-orange/15 px-3 py-1 rounded-full">
            Restons en contact
          </span>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Une question sur nos épices, un projet de partenariat ou besoin d'un renseignement sur votre commande ? Notre équipe vous répond rapidement.
          </p>
        </div>

        {/* Grille principale : Formulaire & Coordonnées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Bloc Coordonnées (1 colonne sur Desktop) */}
          <div className="lg:col-span-1 bg-card border border-border/80 rounded-3xl p-8 space-y-8 shadow-xs">
            <div>
              <h3 className="text-lg font-bold">Nos Coordonnées</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Basés en Algérie, nous sélectionnons le meilleur pour vos cuisines.
              </p>
            </div>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-shop-orange/10 text-shop-orange shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Adresse</h4>
                  <p className="text-sm font-medium mt-0.5">Delly Ibrahim, Alger <br />Algérie</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-shop-orange/10 text-shop-orange shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Email</h4>
                  <p className="text-sm font-medium mt-0.5">contact@tejpatta.dz</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-shop-orange/10 text-shop-orange shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Téléphone</h4>
                  <p className="text-sm font-medium mt-0.5">+213 (0) 23 78 78 78</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-shop-orange/10 text-shop-orange shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Horaires d'ouverture</h4>
                  <p className="text-sm font-medium mt-0.5">Dimanche – Jeudi : 9h00 – 18h00</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-shop-orange shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Vous êtes un professionnel ? Sélectionnez l'option "Professionnel" dans le formulaire pour renseigner vos détails d'établissement.
                </p>
              </div>
            </div>
          </div>

          {/* Bloc Formulaire d'envoi d'email (2 colonnes sur Desktop) */}
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-8 md:p-10 shadow-xs">
            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Message envoyé avec succès !</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Merci pour votre message. L'équipe Tej Patta a bien reçu votre demande et vous répondra par email dans les plus brefs délais.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', companyName: '', businessActivity: 'restaurant', companyAddress: '', companyPhone: '', subject: '', message: '' });
                    }}
                    className="px-6 py-2.5 bg-shop-orange text-white text-xs font-semibold rounded-xl hover:bg-shop-orange/90 transition-colors cursor-pointer"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Envoyez-nous un message</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Précisez votre profil ci-dessous pour router votre demande vers le bon service.
                  </p>
                </div>

                {/* Sélecteur Type de Profil (Radio boutons sous forme de cartes cliquables) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vous êtes :
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label 
                      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        profileType === 'particulier' 
                          ? 'border-shop-orange bg-shop-orange/5 text-foreground font-semibold' 
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-border/80'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="profileType" 
                        value="particulier"
                        checked={profileType === 'particulier'}
                        onChange={() => setProfileType('particulier')}
                        className="accent-shop-orange"
                      />
                      <User className="w-4 h-4 text-shop-orange" />
                      <span className="text-xs md:text-sm">Particulier</span>
                    </label>

                    <label 
                      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        profileType === 'professionnel' 
                          ? 'border-shop-orange bg-shop-orange/5 text-foreground font-semibold' 
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-border/80'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="profileType" 
                        value="professionnel"
                        checked={profileType === 'professionnel'}
                        onChange={() => setProfileType('professionnel')}
                        className="accent-shop-orange"
                      />
                      <Building2 className="w-4 h-4 text-shop-orange" />
                      <span className="text-xs md:text-sm">Professionnel</span>
                    </label>
                  </div>
                </div>

                {/* CHAMPS SUPPLÉMENTAIRES SI PROFESSIONNEL */}
                {profileType === 'professionnel' && (
                  <div className="p-6 rounded-2xl bg-muted/30 border border-shop-orange/30 space-y-4 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-shop-orange">
                      Informations de votre établissement
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="companyName" className="text-xs font-medium text-muted-foreground">
                          Nom de l'établissement
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          required={profileType === 'professionnel'}
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Ex. Restaurant Le Gourmet"
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="businessActivity" className="text-xs font-medium text-muted-foreground">
                          Activité principale
                        </label>
                        <select
                          id="businessActivity"
                          name="businessActivity"
                          value={formData.businessActivity}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50 cursor-pointer"
                        >
                          <option value="restaurant">Restaurant</option>
                          <option value="revendeur">Revendeur</option>
                          <option value="distributeur">Distributeur</option>
                          <option value="autre_ pro">Autre professionnel</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="companyAddress" className="text-xs font-medium text-muted-foreground">
                          Adresse de l'établissement
                        </label>
                        <input
                          type="text"
                          id="companyAddress"
                          name="companyAddress"
                          required={profileType === 'professionnel'}
                          value={formData.companyAddress}
                          onChange={handleChange}
                          placeholder="Ex. 12 rue Didouche Mourad, Alger"
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="companyPhone" className="text-xs font-medium text-muted-foreground">
                          Téléphone de l'établissement
                        </label>
                        <input
                          type="tel"
                          id="companyPhone"
                          name="companyPhone"
                          required={profileType === 'professionnel'}
                          value={formData.companyPhone}
                          onChange={handleChange}
                          placeholder="Ex. +213 21 XX XX XX"
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CHAMPS COMMUNS NOM & EMAIL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {profileType === 'professionnel' ? 'Nom du contact / Responsable' : 'Votre Nom complet'}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex. Karim Benali"
                      className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Votre Adresse Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ex. karim@example.com"
                      className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sujet de votre demande
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Sélectionnez un sujet</option>
                    <option value="commande">Suivi de commande / Livraison</option>
                    <option value="produit">Information sur un produit / Épice</option>
                    <option value="b2b">Partenariat B2B / Commandes en gros</option>
                    <option value="autre">Autre question</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Votre Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Écrivez votre message ici..."
                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-shop-orange/50 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-shop-orange text-white text-xs font-semibold rounded-xl hover:bg-shop-orange/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Envoi en cours...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}