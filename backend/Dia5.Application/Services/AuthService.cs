using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dia5.Application.DTOs;
using Dia5.Application.Interfaces;
using Dia5.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Dia5.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUsuarioRepository usuarioRepository, IConfiguration configuration)
    {
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Senha))
        {
            throw new InvalidOperationException("E-mail e senha são obrigatórios.");
        }

        var usuarioExistente = await _usuarioRepository.GetByEmailAsync(dto.Email);
        if (usuarioExistente != null)
        {
            throw new InvalidOperationException("Já existe um usuário cadastrado com este e-mail.");
        }

        var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);
        var codigoPerfil = await GerarCodigoPerfilUnicoAsync();

        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = senhaHash,
            CodigoPerfil = codigoPerfil,
            IsGuest = false
        };

        usuario.Validar();

        await _usuarioRepository.AddAsync(usuario);
        await _usuarioRepository.SaveChangesAsync();

        var token = GerarJwtToken(usuario);

        return new AuthResponseDto
        {
            Token = token,
            UserId = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            CodigoPerfil = usuario.CodigoPerfil
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var usuario = await _usuarioRepository.GetByEmailAsync(dto.Email);
        if (usuario == null || string.IsNullOrEmpty(usuario.SenhaHash))
        {
            throw new InvalidOperationException("E-mail ou senha inválidos.");
        }

        var senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash);
        if (!senhaValida)
        {
            throw new InvalidOperationException("E-mail ou senha inválidos.");
        }

        var token = GerarJwtToken(usuario);

        return new AuthResponseDto
        {
            Token = token,
            UserId = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email ?? string.Empty,
            CodigoPerfil = usuario.CodigoPerfil ?? string.Empty
        };
    }

    private async Task<string> GerarCodigoPerfilUnicoAsync()
    {
        string codigo;
        do
        {
            codigo = Guid.NewGuid().ToString("N")[..6].ToUpper();
        } while (await _usuarioRepository.GetByCodigoPerfilAsync(codigo) != null);

        return codigo;
    }

    private string GerarJwtToken(Usuario usuario)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "MinhaChaveSecretaSuperSeguraDia5App2026!";
        var key = Encoding.UTF8.GetBytes(secretKey);

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Email, usuario.Email ?? string.Empty)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
