import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto): Promise<AuthResponseDto> {
    if (!dto.email || !dto.senha) {
      throw new BadRequestException('E-mail e senha são obrigatórios.');
    }

    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new BadRequestException('Já existe um usuário cadastrado com este e-mail.');
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(dto.senha, salt);
    const codigoPerfil = await this.generateUniqueProfileCode();

    const user = new User();
    user.id = randomUUID();
    user.nome = dto.nome;
    user.email = dto.email;
    user.senhaHash = senhaHash;
    user.codigoPerfil = codigoPerfil;
    user.isGuest = false;

    // Roda validações de regras de domínio
    user.validar();

    await this.userRepository.save(user);

    const token = this.generateJwtToken(user);

    return {
      token,
      userId: user.id,
      nome: user.nome,
      email: user.email!,
      codigoPerfil: user.codigoPerfil!,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.senhaHash) {
      throw new BadRequestException('E-mail ou senha inválidos.');
    }

    const isPasswordValid = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!isPasswordValid) {
      throw new BadRequestException('E-mail ou senha inválidos.');
    }

    const token = this.generateJwtToken(user);

    return {
      token,
      userId: user.id,
      nome: user.nome,
      email: user.email || '',
      codigoPerfil: user.codigoPerfil || '',
    };
  }

  private async generateUniqueProfileCode(): Promise<string> {
    let codigo: string;
    let exists = true;
    while (exists) {
      codigo = randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase();
      const existing = await this.userRepository.findOne({ where: { codigoPerfil: codigo } });
      if (!existing) {
        exists = false;
      }
    }
    return codigo!;
  }

  private generateJwtToken(user: User): string {
    const payload = {
      sub: user.id,
      nome: user.nome,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }
}
