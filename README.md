# Chá de Casa Nova da Cilce

Convite responsivo em **Next.js App Router + TypeScript + Tailwind**, com confirmação de presença, seleção de vários presentes e contribuições para a mesa, MongoDB Atlas/Mongoose e painel `/admin` protegido.

## Configuração

Requisitos: Node.js 20.9+ e um cluster MongoDB Atlas (replica set, necessário para transações). Libere o IP do servidor nas regras de rede do Atlas e crie um usuário do banco com permissão de leitura e escrita.

```bash
npm install
```

Copie `.env.example` para `.env.local` (ou `.env`) e preencha as variáveis. Use um banco exclusivo ou uma coleção própria para o evento. Gere a senha do painel com:

```bash
npm run hash-password
```

Copie o hash exibido para `ADMIN_PASSWORD_HASH`. Em `.env` ou `.env.local`, coloque `\` antes de cada `$` do hash (por exemplo, `\$2b\$12\$...`), pois o Next.js expande variáveis nesses arquivos. Na Vercel, cole o hash original, sem as barras. Gere `SESSION_SECRET` com ao menos 32 caracteres aleatórios; no PowerShell:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Rode o seed uma vez. O comando pode ser repetido: ele adiciona itens ausentes sem sobrescrever edições ou reservas. O comando carrega `.env` e `.env.local` quando existirem:

```bash
npm run seed
npm run dev
```

Abra `http://localhost:3000` para o convite e `http://localhost:3000/admin` para o painel. A data, o horário, o endereço e um recado adicional são editáveis na aba **Convite** do painel. Enquanto estiverem vazios, o convite mostra “a confirmar”.

## Checklist da imagem

O seed em `src/lib/seed-data.ts` transcreve as **50 entradas** da imagem fornecida, na ordem das duas colunas. A imagem contém “Porta temperos” duas vezes; ambas as entradas foram preservadas como itens independentes. Abreviações e a grafia “Amassiador de carne” também foram mantidas como aparecem na imagem. Se quiser corrigir um nome para o convite, faça isso na aba **Itens** após o seed.

## Como funciona

- A pessoa informa o nome, confirma se vai comparecer, escolhe qualquer quantidade de itens disponíveis e pode marcar doce, salgado e/ou refrigerante.
- Se não encontrar um presente na lista, pode escrever outro no campo livre; ele fica registrado com a resposta no painel. O texto livre não cria uma reserva na lista pública.
- A confirmação e todas as reservas são gravadas em uma única transação MongoDB. Cada item só é atribuído se ainda estiver ativo e livre. Se alguém reservar ao mesmo tempo, a operação inteira é cancelada e o visitante recebe um aviso para atualizar a lista.
- O painel mostra respostas, presentes e contribuições. O administrador pode adicionar, renomear, ocultar, exibir e excluir itens livres. Itens já reservados podem ser ocultados, mas não excluídos, para manter o histórico das respostas.
- O administrador pode excluir uma confirmação no painel. A resposta e as reservas da pessoa são alteradas na mesma transação, liberando imediatamente os presentes. Se uma resposta for excluída diretamente no Atlas, o site libera as reservas órfãs ao carregar o convite ou o painel.
- O login usa hash bcrypt, limitação de tentativas por IP no MongoDB, sessão assinada com expiração de 8 horas e cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção. As rotas administrativas verificam a sessão no servidor; requisições de alteração exigem mesma origem.

## Build e publicação

```bash
npm run typecheck
npm run build
npm start
```

Publique em uma plataforma que execute o servidor Node.js do Next.js e configure as mesmas quatro variáveis de ambiente. Este projeto não é uma exportação estática. Use HTTPS em produção para o cookie seguro. O banco e as credenciais não acompanham o código.

### Publicar na Vercel

1. Envie o conteúdo desta pasta a um repositório Git e importe-o na Vercel como projeto **Next.js**. O projeto fixa Node.js 22 em `package.json`.
2. Em **Project Settings → Environment Variables**, cadastre `MONGODB_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` e `SESSION_SECRET` para **Production** (e para **Preview**, se desejar testar previews). Use a URI do Atlas com `/casanova` antes do `?`. Não inclua `.env` no Git. `MONGODB_DNS_SERVERS=1.1.1.1` foi necessário apenas no computador local; não o configure na Vercel sem observar o mesmo erro lá.
3. O usuário de banco da URI precisa de leitura e escrita no banco `casanova`. As Functions da Vercel usam IPs de saída dinâmicos por padrão. Sem **Static IPs**, configure `0.0.0.0/0` em **Atlas → Network Access** para que a Vercel consiga conectar; essa opção permite tentativas de conexão de qualquer origem, então use um usuário exclusivo com permissão apenas no banco `casanova` e senha forte. Para restringir os IPs no Atlas, habilite **Static IPs** na Vercel e inclua os endereços fornecidos por ela.
4. Execute `npm run seed` localmente com a mesma URI de produção antes de publicar. O seed é idempotente e não precisa rodar no build da Vercel. Após adicionar ou mudar variáveis na Vercel, faça um novo deploy.

Se aparecer `querySrv ECONNREFUSED` ao usar uma URI `mongodb+srv://`, o resolvedor DNS local pode não responder a consultas SRV. Teste `nslookup -type=SRV _mongodb._tcp.SEU_CLUSTER.mongodb.net`. Como alternativa, configure `MONGODB_DNS_SERVERS=1.1.1.1` no `.env.local`/`.env` ou copie do Atlas a URI padrão `mongodb://` (desative **SRV Connection String** em **Connect → Drivers**). Esta opção afeta apenas a resolução DNS do processo Node.

## Estrutura principal

- `src/app/page.tsx` e `src/components/invitation.tsx`: convite e formulário.
- `src/app/api/rsvp/route.ts`: confirmação e reservas atômicas.
- `src/app/admin` e `src/app/api/admin`: painel e rotas protegidas.
- `src/lib/models.ts`: modelos Mongoose.
- `scripts/seed.ts`: carga inicial fiel à imagem.
