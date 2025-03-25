export function resetPasswordTemplate(resetCode: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>R&eacute;initialisation de votre mot de passe</h2>
      <p>Vous avez demand&eacute; &agrave; r&eacute;initialiser votre mot de passe. Voici votre code de v&eacute;rification :</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">${resetCode}</div>
      <p>Ce code est valable pendant 30 minutes.</p>
      <p>Si vous n'avez pas demand&eacute; &agrave; r&eacute;initialiser votre mot de passe, veuillez ignorer cet email.</p>
      <p>Cordialement,<br>Votre &eacute;quipe <strong><span style="color: #3598db;">T-Shop</span></strong></p>
      </div>
    `;
}