/**
 * @file userLogin.js - Benutzeranmeldungs-Funktionalität
 * @author Farah
 * @description Behandelt den Anmeldeprozess und das Session-Management für Benutzer
 * 
 * @requires ../production-config
 */

import prodconfig from "../production-config";

/**
 * @function userLogin
 * @description Führt die Benutzeranmeldung durch, speichert Session-Informationen
 * und leitet zum Dashboard weiter
 * 
 * @param {string} username - Der Benutzername für die Anmeldung
 * @param {string} password - Das Passwort für die Anmeldung
 * @param {Function} navigate - React Router Navigate-Funktion für die Weiterleitung
 * 
 * @throws {Error} Bei fehlgeschlagener Anmeldung
 * 
 * @example
 * userLogin('benutzer@mail.de', 'passwort123', navigate);
 * 
 * @note Speichert nach erfolgreicher Anmeldung:
 * - currentUserId
 * - currentUserName
 * - isAdmin Status
 * im localStorage
 */
export async function userLogin(username, password, navigate) {
  try {
    const response = await fetch(`${prodconfig.backendUrl}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Anmeldung fehlgeschlagen.");
    }

    localStorage.setItem("currentUserId", data.userId);
    localStorage.setItem("currentUserName", username);
    localStorage.setItem("isAdmin", String(data.isAdmin));
    navigate("/dashboard");
  } catch (error) {
    console.error("Error:", error);
    alert(error.message || "Anmeldung fehlgeschlagen. Bitte versuche es erneut.");
  }
}
