import { createClient } from '@repo/database/server';
import { updateUserRoleAction, updateUserStatusAction, deleteUserAction } from '@/actions/actionUserManagement';
import { CheckCircle, Shield, Mail, Phone, Calendar, User, Lock, Unlock, Trash2 } from 'lucide-react';
import { DeleteUserButton } from '@/components/atoms/DeleteUserButton';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Récupérer tous les profils utilisateurs
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nom', { ascending: true });

  if (error) {
    return (
      <div className="p-6 text-destructive text-xs">
        Erreur lors du chargement des utilisateurs : {error.message}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestion des utilisateurs</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gérez les rôles, validez, bloquez ou supprimez les accès des utilisateurs.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-semibold">
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Naissance</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {profiles && profiles.length > 0 ? (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-muted/20 transition-colors">
                    {/* Nom, Prénom & Email */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {profile.nom || 'Sans nom'} {profile.prenom || ''}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1.5 mt-0.5 text-[11px]">
                        <Mail className="w-3 h-3" />
                        {profile.email}
                      </div>
                    </td>

                    {/* Téléphone & WhatsApp */}
                    <td className="py-3 px-4">
                      <div className="text-foreground flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        {profile.telephone || 'Non renseigné'}
                      </div>
                      {profile.whatsapp && (
                        <div className="text-muted-foreground text-[11px] mt-0.5">
                          WA: {profile.whatsapp}
                        </div>
                      )}
                    </td>

                    {/* Date de naissance */}
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {profile.date_naissance ? new Date(profile.date_naissance).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    {/* Rôle modifiable via formulaire */}
                    <td className="py-3 px-4">
                      <form action={updateUserRoleAction.bind(null, profile.id)} className="flex items-center gap-1.5">
                        <select
                          name="role"
                          defaultValue={profile.role}
                          className="px-2 py-1 border border-border rounded-lg bg-background text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="manager">Manager</option>
                          <option value="admin">Administrateur</option>
                        </select>
                        <button
                          type="submit"
                          className="px-2 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                          title="Mettre à jour le rôle"
                        >
                          OK
                        </button>
                      </form>
                    </td>

                    {/* Statut (Approuvé, En attente, Bloqué) */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          profile.status === 'approved'
                            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                            : profile.status === 'blocked'
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {profile.status === 'approved' ? 'Approuvé' : profile.status === 'blocked' ? 'Bloqué' : 'En attente'}
                      </span>
                    </td>

                    {/* Actions : Valider / Bloquer / Débloquer / Supprimer */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Si en attente ou bloqué -> Bouton Valider */}
                        {profile.status !== 'approved' && (
                          <form action={updateUserStatusAction.bind(null, profile.id, 'approved')}>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-[11px] transition-colors cursor-pointer shadow-xs"
                              title="Valider le compte"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Valider
                            </button>
                          </form>
                        )}

                        {/* Si approuvé -> Bouton Bloquer (accès temporaire) */}
                        {profile.status === 'approved' && (
                          <form action={updateUserStatusAction.bind(null, profile.id, 'blocked')}>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-[11px] transition-colors cursor-pointer shadow-xs"
                              title="Bloquer temporairement l'accès"
                            >
                              <Lock className="w-3 h-3" />
                              Bloquer
                            </button>
                          </form>
                        )}

                        {/* Si bloqué -> Bouton Débloquer */}
                        {profile.status === 'blocked' && (
                          <form action={updateUserStatusAction.bind(null, profile.id, 'approved')}>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-[11px] transition-colors cursor-pointer shadow-xs"
                              title="Débloquer l'accès"
                            >
                              <Unlock className="w-3 h-3" />
                              Débloquer
                            </button>
                          </form>
                        )}

                        {/* Bouton de suppression */}
                        <DeleteUserButton userId={profile.id} deleteAction={deleteUserAction} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}