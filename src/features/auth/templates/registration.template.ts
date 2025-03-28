export function registrationVerificationTemplate(verificationCode: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Confirmation de votre inscription</h2>
      <p>Bienvenue sur <strong><span style="color: #3598db;">T-Shop</span></strong> ! Vous êtes sur le point de créer votre compte.</p>
      <p>Veuillez utiliser le code de vérification ci-dessous pour finaliser votre inscription :</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">${verificationCode}</div>
      <p>Ce code est valable pendant 30 minutes.</p>
      <p>Si vous n'avez pas initié cette inscription, veuillez ignorer cet email.</p>
      <p>Cordialement,<br>L'équipe <strong><span style="color: #3598db;">T-Shop</span></strong></p>
      </div>
    `;
}