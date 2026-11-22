'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { MapPin, Phone, Wallet } from 'lucide-react';
import {
  validerCodeAction,
  accepterAction,
  refuserAction,
  demarrerAction,
  declarerMontantAction,
} from '@/actions/actionLivreur';

type Adresse = { adresse_complete: string; type_lieu: string; url_google_maps: string | null };
type Ligne = { id: string; quantite: number; produits: { nom: string } | { nom: string }[] | null };
type Contact = { nom: string | null; prenom: string | null; telephone: string | null } | null;
type Msg = { ok: boolean; texte: string } | null;

export type Livraison = {
  id: string;
  total: number | string;
  statut: string;
  code_recu_at: string | null;
  acceptee_at: string | null;
  expediee_at: string | null;
  montant_declare: number | string | null;
  remise_at: string | null;
  adresses_livraison: Adresse | Adresse[] | null;
  order_items: Ligne[];
};

const bouton = 'px-4 py-2 text-white text-xs font-bold rounded-xl disabled:opacity-50';
const champ = 'px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm';

const euros = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DA`;
const nomProduit = (p: Ligne['produits']) => (Array.isArray(p) ? p[0]?.nom : p?.nom) ?? 'Produit';

function Message({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return <p className={`text-xs ${msg.ok ? 'text-green-600' : 'text-destructive'}`}>{msg.texte}</p>;
}

function CodeForm({ orderId }: { orderId: string }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<Msg>(null);
  const [isPending, startTransition] = useTransition();

  const soumettre = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const r = await validerCodeAction(orderId, code);
      setMsg({ ok: r.ok, texte: r.message });
      if (r.ok) setCode('');
    });
  };

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-foreground">Code de livraison reçu du manager</label>
      <div className="flex gap-2">
        <input
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className={`${champ} w-32 font-mono tracking-widest text-center`}
        />
        <button type="submit" disabled={isPending || code.length !== 6} className={`${bouton} bg-shop-orange`}>
          {isPending ? '...' : 'Valider'}
        </button>
      </div>
      <Message msg={msg} />
    </form>
  );
}

function AccepterRefuser({ orderId }: { orderId: string }) {
  const [refus, setRefus] = useState(false);
  const [motif, setMotif] = useState('');
  const [msg, setMsg] = useState<Msg>(null);
  const [isPending, startTransition] = useTransition();

  const lancer = (action: () => Promise<{ ok: boolean; message: string }>) => {
    setMsg(null);
    startTransition(async () => {
      const r = await action();
      setMsg({ ok: r.ok, texte: r.message });
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-foreground">Acceptez-vous cette livraison ?</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => lancer(() => accepterAction(orderId))}
          className={`${bouton} bg-green-600`}
        >
          Accepter
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setRefus((v) => !v)}
          className={`${bouton} bg-red-600`}
        >
          Refuser
        </button>
      </div>
      {refus && (
        <div className="flex gap-2">
          <input
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Motif du refus"
            className={`${champ} flex-1`}
          />
          <button
            type="button"
            disabled={isPending || motif.trim().length < 5}
            onClick={() => lancer(() => refuserAction(orderId, motif))}
            className={`${bouton} bg-red-600`}
          >
            Confirmer
          </button>
        </div>
      )}
      <Message msg={msg} />
    </div>
  );
}

function DemarrerButton({ orderId }: { orderId: string }) {
  const [msg, setMsg] = useState<Msg>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const r = await demarrerAction(orderId);
            setMsg({ ok: r.ok, texte: r.message });
          })
        }
        className={`${bouton} bg-shop-orange self-start`}
      >
        {isPending ? '...' : 'Démarrer la livraison'}
      </button>
      <Message msg={msg} />
    </div>
  );
}

function DeclarerForm({ orderId, total }: { orderId: string; total: number }) {
  const [montant, setMontant] = useState(String(total));
  const [msg, setMsg] = useState<Msg>(null);
  const [isPending, startTransition] = useTransition();

  const soumettre = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const r = await declarerMontantAction(orderId, Number(montant));
      setMsg({ ok: r.ok, texte: r.message });
    });
  };

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-foreground">
        Montant reçu du client (DA), à déclarer après la remise
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className={`${champ} w-40`}
        />
        <button type="submit" disabled={isPending} className={`${bouton} bg-shop-orange`}>
          {isPending ? '...' : 'Déclarer'}
        </button>
      </div>
      <Message msg={msg} />
    </form>
  );
}

export function LivraisonCard({ livraison, contact }: { livraison: Livraison; contact: Contact }) {
  const adresse = Array.isArray(livraison.adresses_livraison)
    ? livraison.adresses_livraison[0]
    : livraison.adresses_livraison;
  const total = Number(livraison.total);
  const statut = livraison.statut;

  const avantDepart = statut === 'payée' || statut === 'en_attente';
  const enCours = statut === 'expédiée';
  const remis = statut === 'livrée';
  const terminee = statut === 'confirmée';

  const etape = avantDepart
    ? !livraison.code_recu_at
      ? 'Valider le code'
      : !livraison.acceptee_at
        ? 'Accepter la livraison'
        : 'Prête à démarrer'
    : enCours
      ? 'En livraison'
      : remis
        ? 'Colis remis'
        : 'Terminée';

  return (
    <article className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono font-semibold text-foreground">#{livraison.id.slice(0, 8)}</span>
        <span className="px-2 py-1 rounded-full bg-muted font-semibold">{etape}</span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <MapPin className="w-4 h-4 text-shop-orange" />
          {adresse?.adresse_complete ?? 'Adresse non renseignée'}
        </p>
        {adresse?.type_lieu && <p className="text-muted-foreground capitalize">Lieu : {adresse.type_lieu}</p>}
        {adresse?.url_google_maps && (
          <a
            href={adresse.url_google_maps}
            target="_blank"
            rel="noopener noreferrer"
            className="text-shop-orange hover:underline"
          >
            Ouvrir dans Google Maps
          </a>
        )}
      </div>

      <ul className="divide-y divide-border">
        {livraison.order_items.map((l) => (
          <li key={l.id} className="py-1 flex justify-between">
            <span>
              {nomProduit(l.produits)} × {l.quantite}
            </span>
          </li>
        ))}
      </ul>

      {enCours && contact && (
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-foreground">
            {contact.prenom} {contact.nom}
          </p>
          {contact.telephone && (
            <a href={`tel:${contact.telephone}`} className="flex items-center gap-2 text-shop-orange">
              <Phone className="w-4 h-4" />
              {contact.telephone}
            </a>
          )}
          <p className="text-muted-foreground">
            Remettez le colis au client. Il saisit le code de confirmation sur sa commande.
          </p>
        </div>
      )}

      {avantDepart && !livraison.code_recu_at && <CodeForm orderId={livraison.id} />}
      {avantDepart && livraison.code_recu_at && !livraison.acceptee_at && (
        <AccepterRefuser orderId={livraison.id} />
      )}
      {avantDepart && livraison.acceptee_at && <DemarrerButton orderId={livraison.id} />}

      {(enCours || remis) && livraison.montant_declare == null && (
        <DeclarerForm orderId={livraison.id} total={total} />
      )}

      {livraison.montant_declare != null && !terminee && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Wallet className="w-4 h-4" />
          Montant déclaré : {euros(Number(livraison.montant_declare))} · en attente de la confirmation du manager
        </p>
      )}

      {terminee && <p className="text-green-600 font-semibold">Vente confirmée. Merci.</p>}
    </article>
  );
}