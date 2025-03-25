import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  successResponse,
  JsonResponse,
} from 'src/common/helpers/json-response.helper';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../users/dto/user.dto';
import { CsrfConfigService } from 'src/config/csrf/config.service';
import { JwtConfigService } from 'src/config/jwt/config.service';
import { JwtService } from '@nestjs/jwt';
import { Request as ExpressRequest, Response } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from '../verification-code/dto/verify-code.dto';
import { VerificationCodeService } from '../verification-code/verification-code.service';
import { VerificationCodeType } from '../verification-code/verification-code.entity';
import { MailService } from 'src/core/services/mail.service';
import { resetPasswordTemplate } from './templates/reset-password.template';


@Injectable()
export class AuthService {
  private readonly revokedTokens: Set<string>;

  constructor(
    private jwtService: JwtService,
    private readonly usersService: UsersService,
    private csrfConfigService: CsrfConfigService,
    private jwtConfigService: JwtConfigService,
    private mailservice: MailService,
    private verificationCodeService: VerificationCodeService
  ) {
    this.revokedTokens = new Set();
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  generateAccessToken(user: UserDto, csrf_token: string): LoginResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const data: LoginResponseDto = {
      access_token: this.jwtService.sign(payload, {
        secret: this.jwtConfigService.secret,
        expiresIn: this.jwtConfigService.expiresIn,
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.jwtConfigService.secret,
        expiresIn: '7d',
      }),
      csrf_token: csrf_token,
      token_type: 'Bearer',
      expired_in: 3600,
      user: plainToClass(UserDto, user),
    };

    return data;
  }

  getTokenFromHeader(authHeader: string): string {
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }

  async login(
    req: ExpressRequest,
    res: Response,
    { email, password }: LoginUserDto,
  ): Promise<JsonResponse<LoginResponseDto>> {
    const user = await this.validateUser(email, password);

    const csrf_token = this.csrfConfigService.generateToken(req, res);

    const data = this.generateAccessToken(user, csrf_token);

    return successResponse(data, `User successfully logged in`, 200);
  }

  async refreshToken(
    req: ExpressRequest,
    res: Response,
    refreshToken: string,
  ): Promise<JsonResponse<LoginResponseDto>> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfigService.secret,
      });
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const csrf_token = this.csrfConfigService.generateToken(req, res);
      const data = this.generateAccessToken(user.data, csrf_token);

      return successResponse(
        plainToClass(LoginResponseDto, data),
        `Token successfully refreshed`,
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getAuthUser(payload: any): Promise<JsonResponse<UserDto>> {
    try {
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Not found');
      }

      return successResponse(
        plainToClass(UserDto, user.data),
        `User successfully gotten`,
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(
    user_id: string,
    user_email: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<JsonResponse<null>> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;
    
    // Vérifier que les nouveaux mots de passe correspondent
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException('Les nouveaux mots de passe ne correspondent pas');
    }
    
    // Récupérer l'utilisateur
    const user = await this.usersService.findByEmail(user_email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    // Vérifier l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }
        
    await this.usersService.updatePassword(user_id, newPassword);
    
    return successResponse(
      null,
      'Mot de passe réinitialisé avec succès',
      200,
    );
  }

  async logout(payload: any): Promise<JsonResponse<null>> {
    try {
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const tokenId = payload.sub + '_' + Date.now();
      this.revokedTokens.add(tokenId);

      this.cleanupRevokedTokens();

      return successResponse(null, 'User successfully logged out', 200);
    } catch (error) {
      throw new UnauthorizedException('Invalid user or session');
    }
  }

  public cleanupRevokedTokens(): void {
    const MAX_REVOKED_TOKENS = 1000;
    if (this.revokedTokens.size > MAX_REVOKED_TOKENS) {
      const tokensArray = Array.from(this.revokedTokens);
      const tokensToRemove = tokensArray.slice(
        0,
        tokensArray.length - MAX_REVOKED_TOKENS,
      );
      tokensToRemove.forEach((token) => this.revokedTokens.delete(token));
    }
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  // Envoyer un email avec le code
  async sendResetPasswordEmail(
    forgotPasswordDto: ForgotPasswordDto
  ): Promise<JsonResponse<null>> {
    const { email } = forgotPasswordDto;
    
    // Vérifier que l'utilisateur existe
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Pour des raisons de sécurité, ne pas indiquer si l'email existe ou non
      return successResponse(
        null,
        "Si l'adresse email est valide, un code de réinitialisation a été envoyé",
        200,
      );
    }
    
    // Générer un code et le stocker avec une expiration (30 minutes)
    const resetCode = await this.verificationCodeService.createVerificationCode(
      email,
      VerificationCodeType.PASSWORD_RESET
    );
    
    const emailSent = await this.mailservice.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      body: resetPasswordTemplate(resetCode)
    });

    if (!emailSent) {
      throw new InternalServerErrorException("Échec lors de l'envoi de l'email");
    }
  
    return successResponse(
      undefined,
      'Un code de réinitialisation a été envoyé à votre adresse email',
      200,
    );

  }

  // Vérifier le code de réinitialisation
  async verifyResetCode(verifyCodeDto: VerifyCodeDto): Promise<JsonResponse<null>> {
    const { email, code } = verifyCodeDto;
    
    // Utiliser le service de vérification pour valider le code
    try {
      await this.verificationCodeService.verifyCode(email, code, VerificationCodeType.PASSWORD_RESET);
      
      return successResponse(
        null,
        'Code de réinitialisation validé',
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Code de réinitialisation invalide ou expiré');
    }
  }



  // Définir un nouveau mot de passe
  async setNewPassword(resetPasswordDto: ResetPasswordDto): Promise<JsonResponse<null>> {
    const { email, newPassword, confirmPassword } = resetPasswordDto;
    
    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException('Les mots de passe ne correspondent pas');
    }
    
    // Vérifier que l'utilisateur existe
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    // Vérifier que le code a été validé
    const isVerified = await this.verificationCodeService.isCodeVerified(
      email,
      VerificationCodeType.PASSWORD_RESET
    );
    
    if (!isVerified) {
      throw new UnauthorizedException("Vous devez d'abord valider un code de réinitialisation");
    }
    
    // Mettre à jour le mot de passe
    await this.usersService.updatePassword(user.id, newPassword);
    
    // Supprimer le code de réinitialisation vérifié
    await this.verificationCodeService.removeVerifiedCode(
      email,
      VerificationCodeType.PASSWORD_RESET
    );
    
    return successResponse(
      null,
      'Mot de passe réinitialisé avec succès',
      200,
    );
  }

}
