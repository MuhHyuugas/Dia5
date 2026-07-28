import { User } from './user.entity';

describe('User Domain Entity', () => {
  it('should throw an error when name is empty', () => {
    const user = new User();
    user.nome = '';
    user.isGuest = false;
    user.email = 'test@example.com';
    user.senhaHash = 'hashedPassword';

    expect(() => user.validar()).toThrow('O nome do usuário é obrigatório.');
  });

  it('should throw an error when guest user does not have a creator', () => {
    const user = new User();
    user.nome = 'Guest User';
    user.isGuest = true;
    user.criadoPorId = null;

    expect(() => user.validar()).toThrow('Um usuário convidado deve obrigatoriamente ter um usuário criador.');
  });

  it('should throw an error when guest user has an email or password', () => {
    const user = new User();
    user.nome = 'Guest User';
    user.isGuest = true;
    user.criadoPorId = 'creator-uuid';
    user.email = 'guest@example.com';

    expect(() => user.validar()).toThrow('Usuários convidados não podem possuir e-mail ou senha.');
  });

  it('should pass validation when guest user is valid', () => {
    const user = new User();
    user.nome = 'Guest User';
    user.isGuest = true;
    user.criadoPorId = 'creator-uuid';

    expect(() => user.validar()).not.toThrow();
  });

  it('should pass validation when real user is valid', () => {
    const user = new User();
    user.nome = 'Real User';
    user.isGuest = false;
    user.email = 'real@example.com';
    user.senhaHash = 'hashedPassword';

    expect(() => user.validar()).not.toThrow();
  });
});
