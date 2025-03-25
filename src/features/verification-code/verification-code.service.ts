import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationCodeEntity, VerificationCodeType } from './verification-code.entity';

@Injectable()
export class VerificationCodeService {
  constructor(
    @InjectRepository(VerificationCodeEntity)
    private verificationCodesRepository: Repository<VerificationCodeEntity>,
  ) {}

  // Générer un code aléatoire à 6 chiffres
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Créer un nouveau code de vérification
  async createVerificationCode( email: string, type: VerificationCodeType): Promise<string> {
    // Supprimer les anciens codes pour cet email et ce type
    await this.verificationCodesRepository.delete({ email, type });

    // Créer un nouveau code
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Sauvegarder dans la base de données
    await this.verificationCodesRepository.save({
      email,
      code,
      type,
      expiresAt,
      isVerified: false,
    });

    return code;
  }

  // Vérifier un code
  async verifyCode( email: string, code: string, type: VerificationCodeType): Promise<boolean> {
    // Rechercher le code
    const verificationCode = await this.verificationCodesRepository.findOne({
      where: {email, code, type},
    });

    // Vérifier que le code existe
    if (!verificationCode) {
      throw new UnauthorizedException('Code de vérification invalide');
    }

    // Vérifier que le code n'est pas expiré
    if (verificationCode.expiresAt < new Date()) {
      throw new UnauthorizedException('Code de vérification expiré');
    }

    // Marquer comme vérifié
    verificationCode.isVerified = true;
    await this.verificationCodesRepository.save(verificationCode);

    return true;
  }

  // Vérifier si un code a été validé
  async isCodeVerified( email: string, type: VerificationCodeType): Promise<boolean> {
    const verificationCode = await this.verificationCodesRepository.findOne({
      where: {email, type, isVerified: true},
    });

    return !!verificationCode;
  }

  // Supprimer un code vérifié après utilisation
  async removeVerifiedCode( email: string, type: VerificationCodeType): Promise<void> {
    await this.verificationCodesRepository.delete({ email, type});
  }
}