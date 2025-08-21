import { supabase } from "./supabase";

// Definiere die Typen intern
interface Game {
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
}

interface CreateGameRequest {
  team1: string;
  team2: string;
  total_tickets: number;
  game_date: string;
  ticket_decision_days: number;
}

interface CreateGameResponse {
  success: boolean;
  message: string;
  game?: Game;
}

export class GameService {
  // Alle Spiele abrufen
  static async getAllGames(): Promise<{
    success: boolean;
    games?: Game[];
    message: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("game_date", { ascending: true });

      if (error) {
        console.error("Fehler beim Laden der Spiele:", error);
        return {
          success: false,
          message: "Fehler beim Laden der Spiele",
        };
      }

      return {
        success: true,
        games: data || [],
        message: "Spiele erfolgreich geladen",
      };
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      return {
        success: false,
        message: "Unerwarteter Fehler beim Laden der Spiele",
      };
    }
  }

  // Neues Spiel erstellen
  static async createGame(
    gameData: CreateGameRequest,
    userId: string
  ): Promise<CreateGameResponse> {
    try {
      // Validierung
      if (!gameData.team1.trim() || !gameData.team2.trim()) {
        return {
          success: false,
          message: "Beide Teams müssen angegeben werden",
        };
      }

      if (gameData.total_tickets <= 0) {
        return {
          success: false,
          message: "Die Anzahl der Tickets muss größer als 0 sein",
        };
      }

      if (gameData.ticket_decision_days < 1 || gameData.ticket_decision_days > 30) {
        return {
          success: false,
          message: "Die Ticketvergabe-Zeit muss zwischen 1 und 30 Tagen liegen",
        };
      }

      const gameDate = new Date(gameData.game_date);
      if (gameDate <= new Date()) {
        return {
          success: false,
          message: "Das Spiel-Datum muss in der Zukunft liegen",
        };
      }

      const { data, error } = await supabase
        .from("games")
        .insert([
          {
            team1: gameData.team1.trim(),
            team2: gameData.team2.trim(),
            total_tickets: gameData.total_tickets,
            available_tickets: gameData.total_tickets, // Anfangs sind alle Tickets verfügbar
            game_date: gameData.game_date,
            ticket_decision_days: gameData.ticket_decision_days,
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Fehler beim Erstellen des Spiels:", error);
        return {
          success: false,
          message: "Fehler beim Erstellen des Spiels",
        };
      }

      return {
        success: true,
        message: "Spiel erfolgreich erstellt!",
        game: data,
      };
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      return {
        success: false,
        message: "Unerwarteter Fehler beim Erstellen des Spiels",
      };
    }
  }

  // Spiel löschen
  static async deleteGame(
    gameId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.from("games").delete().eq("id", gameId);

      if (error) {
        console.error("Fehler beim Löschen des Spiels:", error);
        return {
          success: false,
          message: "Fehler beim Löschen des Spiels",
        };
      }

      return {
        success: true,
        message: "Spiel erfolgreich gelöscht!",
      };
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      return {
        success: false,
        message: "Unerwarteter Fehler beim Löschen des Spiels",
      };
    }
  }
}
