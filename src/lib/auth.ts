import { supabase } from "./supabase";

// Definiere die Typen direkt hier, um Import-Probleme zu vermeiden
interface User {
  id: string;
  email: string;
  password: string | null; // Changed to allow null
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

  // Whitelist für erlaubte E-Mail-Domains
  private static readonly ALLOWED_DOMAINS = [
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "yahoo.com",
    "icloud.com",
    "protonmail.com",
    "tutanota.com",
    "web.de",
    "gmx.de",
    "t-online.de",
    "freenet.de",
    "1und1.de",
    "arcor.de",
    "freenet.de",
    "posteo.de",
    "mailbox.org",
    "aol.com",
    "live.com",
    "msn.com",
    "me.com",
    "mac.com",
  ];

  // Prüfe ob E-Mail-Adresse von einer erlaubten Domain ist
  private static isEmailAllowed(email: string): boolean {
    const domain = email.toLowerCase().split("@")[1];
    return this.ALLOWED_DOMAINS.includes(domain);
  }

  static async requestLogin(email: string): Promise<LoginResponse> {
    try {
      // Prüfe zuerst ob E-Mail von einer erlaubten Domain ist
      if (!this.isEmailAllowed(email)) {
        return {
          success: false,
          message:
            "Nur E-Mail-Adressen von vertrauenswürdigen Anbietern sind erlaubt (Gmail, Outlook, Yahoo, etc.).",
        };
      }

      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (existingUser) {
        if (existingUser.password) {
          return {
            success: true,
            message:
              "Benutzer gefunden! Du kannst dich jetzt mit deinem Passwort anmelden.",
          };
        } else {
          return {
            success: false,
            message:
              "Dein Account wurde bereits angelegt, aber der Administrator hat noch kein Passwort für dich gesetzt. Bitte warte auf die E-Mail mit deinem Passwort.",
          };
        }
      }

      const { error: createError } = await supabase
        .from("users")
        .insert([
          {
            email: email.toLowerCase(),
            password: null,
            role: "user",
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Fehler beim Erstellen des Benutzers:", createError);
        return {
          success: false,
          message:
            "Fehler beim Erstellen des Accounts. Bitte versuche es erneut oder kontaktiere den Administrator.",
        };
      }
      return {
        success: true,
        message:
          "Account erfolgreich erstellt! Der Administrator wird dir ein Passwort per E-Mail zusenden. Du kannst dich dann anmelden.",
      };
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      return {
        success: false,
        message:
          "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.",
      };
    }
  }

  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Prüfe zuerst ob E-Mail von einer erlaubten Domain ist
      if (!this.isEmailAllowed(email)) {
        return {
          success: false,
          message:
            "Nur E-Mail-Adressen von vertrauenswürdigen Anbietern sind erlaubt (Gmail, Outlook, Yahoo, etc.).",
        };
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("password", password)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: "Ungültige E-Mail oder Passwort.",
        };
      }

      AuthService.currentUser = user;
      return {
        success: true,
        message: "Anmeldung erfolgreich!",
      };
    } catch (error) {
      console.error("Fehler bei der Anmeldung:", error);
      return {
        success: false,
        message: "Ein Fehler ist bei der Anmeldung aufgetreten.",
      };
    }
  }

  static getCurrentUser(): User | null {
    return AuthService.currentUser;
  }

  static logout(): void {
    AuthService.currentUser = null;
  }
}

export type { User, LoginResponse }; // Exported for other files
