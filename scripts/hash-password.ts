import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const password = await rl.question("Senha de administrador (mínimo 12 caracteres): ");
  rl.close();
  if (password.length < 12) throw new Error("Use ao menos 12 caracteres.");
  console.log(await bcrypt.hash(password, 12));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
