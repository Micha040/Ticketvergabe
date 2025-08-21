import { supabase } from "./supabase";

// Definiere die Typen direkt hier, um Import-Probleme zu vermeiden
interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
}

export class AuthService {
  private static currentUser: User | null = null;

  // Benutzer anmelden (nur E-Mail eingeben) - erstellt neuen Benutzer ohne Passwort
  static async requestLogin(email: string): Promise<LoginResponse> {
    try {
      // Prüfe ob der Benutzer bereits existiert
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (existingUser) {
        // Benutzer existiert bereits
        if (existingUser.password) {
          // Benutzer hat bereits ein Passwort - kann sich anmelden
          return {
            success: true,
            message: "Benutzer gefunden! Du kannst dich jetzt mit deinem Passwort anmelden."
          };
        } else {
          // Benutzer existiert aber hat kein Passwort
          return {
            success: false,
            message: "Dein Account wurde bereits angelegt, aber der Administrator hat noch kein Passwort für dich gesetzt. Bitte warte auf die E-Mail mit deinem Passwort."
          };
        }
      }

      // Benutzer existiert nicht - erstelle neuen Benutzer ohne Passwort
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            email: email.toLowerCase(),
            password: null, // Kein Passwort - Admin muss es setzen
            role: "user"
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error("Fehler beim Erstellen des Benutzers:", createError);
        return {
          success: false,
          message: "Fehler beim Erstellen des Accounts. Bitte versuche es erneut oder kontaktiere den Administrator."
        };
      }

      // Hier würde normalerweise eine E-Mail-Benachrichtigung an den Admin gesendet
      // Für Demo-Zwecke geben wir eine Erfolgsmeldung zurück
      return {
        success: true,
        message: "Account erfolgreich erstellt! Der Administrator wird dir ein Passwort per E-Mail zusenden. Du kannst dich dann anmelden."
      };
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      return {
        success: false,
        message: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut."
      };
    }
  }

  // Benutzer mit Passwort anmelden
  static async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("password", password)
        .single();

      if (error || !users) {
        return {
          success: false,
          message: "Ungültige E-Mail oder Passwort.",
        };
      }

      this.currentUser = users;
      return {
        success: true,
        user: users,
        message: "Anmeldung erfolgreich!",
      };
    } catch (error) {
      return {
        success: false,
        message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
      };
    }
  }

  // Aktuellen Benutzer abrufen
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Benutzer abmelden
  static logout(): void {
    this.currentUser = null;
  }

  // Prüfen ob Benutzer angemeldet ist
  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

// Exportiere die Typen für andere Dateien
export type { User, LoginResponse };
