import { useState } from 'react'

interface FooterProps {
  className?: string
}

export default function Footer({ className = '' }: FooterProps) {
  const [showImpressum, setShowImpressum] = useState(false)
  const [showDatenschutz, setShowDatenschutz] = useState(false)

  return (
    <>
      <footer className={`footer ${className}`}>
        <div className="footer-content">
          <div className="footer-links">
            <button 
              onClick={() => setShowImpressum(true)}
              className="footer-link"
            >
              Impressum
            </button>
            <span className="footer-separator">|</span>
            <button 
              onClick={() => setShowDatenschutz(true)}
              className="footer-link"
            >
              Datenschutz
            </button>
          </div>
          <div className="footer-copyright">
            © 2024 Ticketvergabe System
          </div>
        </div>
      </footer>

      {/* Impressum Modal */}
      {showImpressum && (
        <div className="modal-overlay" onClick={() => setShowImpressum(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Impressum</h2>
              <button 
                onClick={() => setShowImpressum(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="impressum-content">
                <h3>Angaben gemäß § 5 TMG</h3>
                <p>
                  <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
                  [Dein Name]<br />
                  [Deine Adresse]<br />
                  [Deine Stadt und PLZ]
                </p>

                <h3>Kontakt</h3>
                <p>
                  <strong>E-Mail:</strong> [deine-email@example.com]<br />
                  <strong>Telefon:</strong> [deine-telefonnummer]
                </p>

                <h3>Haftungsausschluss</h3>
                <p>
                  <strong>Haftung für Inhalte:</strong><br />
                  Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
                  Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
                  können wir jedoch keine Gewähr übernehmen.
                </p>

                <p>
                  <strong>Haftung für Links:</strong><br />
                  Unser Angebot enthält Links zu externen Webseiten Dritter, 
                  auf deren Inhalte wir keinen Einfluss haben. Deshalb können 
                  wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                </p>

                <p>
                  <strong>Urheberrecht:</strong><br />
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke 
                  auf diesen Seiten unterliegen dem deutschen Urheberrecht.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Datenschutz Modal */}
      {showDatenschutz && (
        <div className="modal-overlay" onClick={() => setShowDatenschutz(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Datenschutzerklärung</h2>
              <button 
                onClick={() => setShowDatenschutz(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="datenschutz-content">
                <h3>1. Datenschutz auf einen Blick</h3>
                
                <h4>Allgemeine Hinweise</h4>
                <p>
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, 
                  was mit Ihren personenbezogenen Daten passiert, wenn Sie diese 
                  Website besuchen. Personenbezogene Daten sind alle Daten, mit 
                  denen Sie persönlich identifiziert werden können.
                </p>

                <h4>Datenerfassung auf dieser Website</h4>
                <p>
                  <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
                  Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" 
                  in dieser Datenschutzerklärung entnehmen.
                </p>

                <h4>Wie erfassen wir Ihre Daten?</h4>
                <p>
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. 
                  Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
                </p>

                <h4>Wofür nutzen wir Ihre Daten?</h4>
                <p>
                  Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website 
                  zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                </p>

                <h4>Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
                <p>
                  Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, 
                  Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. 
                  Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten 
                  zu verlangen.
                </p>

                <h3>2. Hosting</h3>
                <p>
                  Wir hosten unsere Website bei Vercel. Anbieter ist Vercel Inc., 
                  340 S Lemon Ave #4133, Walnut, CA 91789, USA.
                </p>

                <h3>3. Allgemeine Hinweise und Pflichtinformationen</h3>
                
                <h4>Datenschutz</h4>
                <p>
                  Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
                  Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den 
                  gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>

                <h4>SSL- bzw. TLS-Verschlüsselung</h4>
                <p>
                  Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung 
                  vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
