import { supabase } from "./supabase";

// Definiere die Typen intern
interface TicketApplication {
  id: string;
  user_id: string;
  game_id: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  decided_at?: string;
  decided_by?: string;
}

interface GameWithApplications {
  id: string;
  team1: string;
  team2: string;
  total_tickets: number;
  available_tickets: number;
  game_date: string;
  ticket_decision_days: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_application?: TicketApplication;
  can_apply: boolean;
  days_until_game: number;
}

interface ApplyForTicketResponse {
  success: boolean;
  message: string;
}

export class TicketService {
  // Alle verfügbaren Spiele für einen Benutzer abrufen
  static async getAvailableGames(userId: string): Promise<{ success: boolean; games?: GameWithApplications[]; message: string }> {
    try {
      // Hole alle Spiele, die in der Zukunft liegen
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .gte('game_date', new Date().toISOString())
        .order('game_date', { ascending: true });

      if (gamesError) {
        console.error('Fehler beim Laden der Spiele:', gamesError);
        return {
          success: false,
          message: 'Fehler beim Laden der Spiele'
        };
      }

      if (!games) {
        return {
          success: true,
          games: [],
          message: 'Keine Spiele verfügbar'
        };
      }

      // Hole alle Bewerbungen des Benutzers
      const { data: applications, error: applicationsError } = await supabase
        .from('ticket_applications')
        .select('*')
        .eq('user_id', userId);

      if (applicationsError) {
        console.error('Fehler beim Laden der Bewerbungen:', applicationsError);
        return {
          success: false,
          message: 'Fehler beim Laden der Bewerbungen'
        };
      }

      // Kombiniere Spiele mit Bewerbungen und prüfe Verfügbarkeit
      const gamesWithApplications: GameWithApplications[] = games.map(game => {
        const userApplication = applications?.find(app => app.game_id === game.id);
        const gameDate = new Date(game.game_date);
        const now = new Date();
        const daysUntilGame = Math.ceil((gameDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Prüfe ob Bewerbung möglich ist (mindestens ticket_decision_days vor Spiel)
        const canApply = daysUntilGame >= game.ticket_decision_days && !userApplication;

        return {
          ...game,
          user_application: userApplication,
          can_apply: canApply,
          days_until_game: daysUntilGame
        };
      });

      return {
        success: true,
        games: gamesWithApplications,
        message: 'Spiele erfolgreich geladen'
      };
    } catch (error) {
      console.error('Unerwarteter Fehler:', error);
      return {
        success: false,
        message: 'Unerwarteter Fehler beim Laden der Spiele'
      };
    }
  }

  // Sich für ein Ticket bewerben
  static async applyForTicket(userId: string, gameId: string): Promise<ApplyForTicketResponse> {
    try {
      // Prüfe ob Spiel existiert und verfügbar ist
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        return {
          success: false,
          message: 'Spiel nicht gefunden'
        };
      }

      // Prüfe ob Spiel in der Zukunft liegt
      const gameDate = new Date(game.game_date);
      const now = new Date();
      const daysUntilGame = Math.ceil((gameDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilGame < game.ticket_decision_days) {
        return {
          success: false,
          message: `Bewerbungen sind nur bis ${game.ticket_decision_days} Tage vor dem Spiel möglich`
        };
      }

      // Prüfe ob bereits eine Bewerbung existiert
      const { data: existingApplication } = await supabase
        .from('ticket_applications')
        .select('*')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .single();

      if (existingApplication) {
        return {
          success: false,
          message: 'Du hast dich bereits für dieses Spiel beworben'
        };
      }

      // Erstelle neue Bewerbung
      const { error: insertError } = await supabase
        .from('ticket_applications')
        .insert([
          {
            user_id: userId,
            game_id: gameId,
            status: 'pending'
          }
        ]);

      if (insertError) {
        console.error('Fehler beim Erstellen der Bewerbung:', insertError);
        return {
          success: false,
          message: 'Fehler beim Erstellen der Bewerbung'
        };
      }

      return {
        success: true,
        message: `Bewerbung erfolgreich eingereicht! Du erhältst ${game.ticket_decision_days} Tage vor dem Spiel Bescheid.`
      };
    } catch (error) {
      console.error('Unerwarteter Fehler:', error);
      return {
        success: false,
        message: 'Unerwarteter Fehler beim Einreichen der Bewerbung'
      };
    }
  }

  // Alle Bewerbungen für ein Spiel abrufen (für Admin)
  static async getApplicationsForGame(gameId: string): Promise<{ success: boolean; applications?: any[]; message: string }> {
    try {
      const { data, error } = await supabase
        .from('ticket_applications')
        .select(`
          *,
          users:user_id(email, name),
          games:game_id(team1, team2, game_date, available_tickets, ticket_decision_days)
        `)
        .eq('game_id', gameId)
        .order('applied_at', { ascending: true });

      if (error) {
        console.error('Fehler beim Laden der Bewerbungen:', error);
        return {
          success: false,
          message: 'Fehler beim Laden der Bewerbungen'
        };
      }

      return {
        success: true,
        applications: data || [],
        message: 'Bewerbungen erfolgreich geladen'
      };
    } catch (error) {
      console.error('Unerwarteter Fehler:', error);
      return {
        success: false,
        message: 'Unerwarteter Fehler beim Laden der Bewerbungen'
      };
    }
  }

  // Bewerbungen entscheiden (für Admin)
  static async decideApplications(gameId: string, adminUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Hole alle Bewerbungen für das Spiel
      const { data: applications, error: applicationsError } = await supabase
        .from('ticket_applications')
        .select(`
          *,
          users:user_id(email, name)
        `)
        .eq('game_id', gameId)
        .eq('status', 'pending')
        .order('applied_at', { ascending: true });

      if (applicationsError) {
        console.error('Fehler beim Laden der Bewerbungen:', applicationsError);
        return {
          success: false,
          message: 'Fehler beim Laden der Bewerbungen'
        };
      }

      // Hole Spiel-Informationen
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        return {
          success: false,
          message: 'Spiel nicht gefunden'
        };
      }

      if (!applications || applications.length === 0) {
        return {
          success: false,
          message: 'Keine ausstehenden Bewerbungen für dieses Spiel'
        };
      }

      // Sortiere Bewerbungen nach Priorität (Benutzer ohne kürzliche Tickets zuerst)
      const sortedApplications = await Promise.all(
        applications.map(async (app) => {
          const hasRecent = await this.hasRecentTicket(app.user_id);
          return { ...app, hasRecentTicket: hasRecent };
        })
      );

      // Sortiere: Benutzer ohne kürzliche Tickets zuerst, dann nach Bewerbungsdatum
      sortedApplications.sort((a, b) => {
        if (a.hasRecentTicket !== b.hasRecentTicket) {
          return a.hasRecentTicket ? 1 : -1;
        }
        return new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime();
      });

      // Verteile Tickets
      const availableTickets = game.available_tickets;
      const approvedCount = Math.min(availableTickets, sortedApplications.length);

      // Aktualisiere Bewerbungen
      const updates = sortedApplications.map((app, index) => ({
        id: app.id,
        status: index < approvedCount ? 'approved' : 'rejected',
        decided_at: new Date().toISOString(),
        decided_by: adminUserId
      }));

      // Batch-Update für alle Bewerbungen
      const { error: updateError } = await supabase
        .from('ticket_applications')
        .upsert(updates);

      if (updateError) {
        console.error('Fehler beim Aktualisieren der Bewerbungen:', updateError);
        return {
          success: false,
          message: 'Fehler beim Aktualisieren der Bewerbungen'
        };
      }

      // Aktualisiere verfügbare Tickets im Spiel
      const newAvailableTickets = Math.max(0, availableTickets - approvedCount);
      const { error: gameUpdateError } = await supabase
        .from('games')
        .update({ available_tickets: newAvailableTickets })
        .eq('id', gameId);

      if (gameUpdateError) {
        console.error('Fehler beim Aktualisieren der verfügbaren Tickets:', gameUpdateError);
        return {
          success: false,
          message: 'Fehler beim Aktualisieren der verfügbaren Tickets'
        };
      }

      return {
        success: true,
        message: `${approvedCount} Bewerbungen genehmigt, ${sortedApplications.length - approvedCount} abgelehnt`
      };
    } catch (error) {
      console.error('Unerwarteter Fehler:', error);
      return {
        success: false,
        message: 'Unerwarteter Fehler beim Entscheiden der Bewerbungen'
      };
    }
  }

  // Hilfsfunktion: Prüfe ob Benutzer kürzlich ein Ticket bekommen hat
  private static async hasRecentTicket(userId: string, daysBack: number = 30): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ticket_applications')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .gte('decided_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Fehler beim Prüfen kürzlicher Tickets:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Prüfen kürzlicher Tickets:', error);
      return false;
    }
  }
}
