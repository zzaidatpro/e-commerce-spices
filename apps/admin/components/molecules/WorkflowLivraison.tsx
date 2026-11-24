'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { assignerLivreurAction, marquerCodeEnvoyeAction, expedierAction } from '@/actions/actionVentes';
import { genererCodeAction, changerStatutAction } from '@/actions/actionOrders';
import { versWhatsapp } from '@/lib/whatsapp';

export type Livreur = {
  id: string;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  code_livreur: string | null;
};

export type EtatCode = {
  existe: boolean;
  envoye_at: string | null;
  expires_at: string | null;
};

const champ = 'px-3 py-2 border border-border rounded-xl bg-background text-foreground text-xs';
const bouton = 'px-3 py-2 bg-shop-orange text-white text-xs font-bold rounded-xl disabled:opacity-50';
const boutonDanger = 'px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-xl disabled:opacity-50';

const formater = (d: string) =>
  new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function LivreurForm({
  orderId,
  livreurs,
  livreurId,
}: {
  orderId: string;
  livreurs: Livreur[];
  livreurId: string | null;
}) {
  const router = useRouter();
  const [valeur, setValeur] = useState(livreurId ?? '');
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [succes, setSucces] = useState(false);
  const enregistrer = () => {
    setErreur(null);
    startTransition(async () => {
      const res = await assignerLivreurAction(orderId, valeur);
      if (res.error) setErreur(res.error);
      else 
      setSucces(true);
      router.refresh();
    });
  };
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select data-testid="livreur-select" value={valeur} onChange={(e) => setValeur(e.target.value)} className={`${champ} flex-1`}>
          <option value="">Choisir un livreur</option>
          {livreurs.map((l) => (
            <option key={l.id} value={l.id}>
              {l.prenom} {l.nom}
            </option>
          ))}
          {succes && <span className="text-[11px] text-green-600">Livreur désigné.</span>}
        </select>
        <button
          type="button"
          onClick={enregistrer}
          disabled={!valeur || valeur === livreurId || isPending}
          className={bouton}
        >
          {isPending ? '...' : 'Désigner'}
        </button>
      </div>
      {erreur && <span data-testid="erreur-designation" className="text-[11px] text-destructive">{erreur}</span>}
    </div>
  );
}

export function CodeLivraisonPanel({
  orderId,
  reference,
  livreur,
  etat,
}: {
  orderId: string;
  reference: string;
  livreur: Livreur | null;
  etat: EtatCode | null;
}) {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [envoyeLocal, setEnvoyeLocal] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!livreur) {
    return <p className="text-xs text-muted-foreground">Désignez d'abord un livreur.</p>;
  }

  const envoye = !!etat?.envoye_at || envoyeLocal;
  const telephone = versWhatsapp(livreur.telephone);
  const message = code
    ? `Bonjour ${livreur.prenom ?? ''}, code de livraison de la commande #${reference} : ${code}. À remettre au client à la livraison.`
    : '';
  const lienWa = telephone && code ? `https://wa.me/${telephone}?text=${encodeURIComponent(message)}` : null;

  const generer = () => {
    setErreur(null);
    setEnvoyeLocal(false);
    startTransition(async () => {
      const res = await genererCodeAction(orderId);
      if (res.error) setErreur(res.error);
      else if (res.code) {
        setCode(res.code);
        router.refresh();
      }
    });
  };

  const confirmerEnvoi = () => {
    setErreur(null);
    startTransition(async () => {
      const res = await marquerCodeEnvoyeAction(orderId);
      if (res.error) setErreur(res.error);
      else {
        setEnvoyeLocal(true);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div>
        <button type="button" onClick={generer} disabled={isPending} className={bouton}>
          {isPending ? '...' : etat?.existe ? 'Régénérer le code' : 'Générer le code'}
        </button>
      </div>

      {code && (
        <div className="p-3 border border-shop-orange/40 rounded-xl bg-shop-orange/5 flex flex-col gap-2">
          <p className="text-muted-foreground">Code à remettre au livreur (affiché une seule fois) :</p>
          <p className="text-2xl font-mono font-bold tracking-widest text-foreground">{code}</p>
          <div className="flex flex-wrap gap-2">
            {lienWa ? (
              <a href={lienWa} target="_blank" rel="noopener noreferrer" className={bouton}>
                Envoyer par WhatsApp
              </a>
            ) : (
              <span className="text-muted-foreground">Aucun téléphone enregistré pour ce livreur.</span>
            )}
            {!envoye && (
              <button
                type="button"
                onClick={confirmerEnvoi}
                disabled={isPending}
                className="px-3 py-2 border border-border rounded-xl text-foreground hover:bg-muted"
              >
                J'ai envoyé le code
              </button>
            )}
          </div>
        </div>
      )}

      {!code && etat?.existe && !envoye && (
        <p className="text-muted-foreground">
          Un code existe mais n'est plus affiché : régénérez-le pour l'envoyer au livreur.
        </p>
      )}

      {envoye && (
        <p className="text-green-600 font-semibold">
          Code envoyé au livreur{etat?.envoye_at ? ` le ${formater(etat.envoye_at)}` : ''}.
        </p>
      )}

      {erreur && <span className="text-destructive">{erreur}</span>}
    </div>
  );
}

export function ExpedierButton({
  orderId,
  livreurId,
  pret,
}: {
  orderId: string;
  livreurId: string;
  pret: boolean;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const expedier = () => {
    setErreur(null);
    startTransition(async () => {
      const res = await expedierAction(orderId, livreurId);
      if (res.error) setErreur(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={expedier} disabled={!pret || isPending} className={bouton}>
        {isPending ? '...' : 'Expédier la commande'}
      </button>
      {!pret && (
        <p className="text-[11px] text-muted-foreground">
          Désignez le livreur et confirmez l'envoi du code pour activer l'expédition.
        </p>
      )}
      {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
    </div>
  );
}

export function ActionStatutButton({
  orderId,
  statut,
  libelle,
  danger = false,
}: {
  orderId: string;
  statut: string;
  libelle: string;
  danger?: boolean;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const executer = () => {
    setErreur(null);
    startTransition(async () => {
      const res = await changerStatutAction(orderId, statut);
      if (res.error) setErreur(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={executer} disabled={isPending} className={danger ? boutonDanger : bouton}>
        {isPending ? '...' : libelle}
      </button>
      {erreur && <span className="text-[11px] text-destructive">{erreur}</span>}
    </div>
  );
}