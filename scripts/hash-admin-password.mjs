import bcrypt from "bcryptjs";
import { stdin, stdout } from "node:process";

function readHiddenPassword() {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Ejecutá este comando desde una terminal interactiva.");
  }

  return new Promise((resolve, reject) => {
    let password = "";
    const finish = (callback, value) => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      callback(value);
    };
    const onData = (chunk) => {
      const key = chunk.toString("utf8");
      if (key === "\u0003") {
        finish(reject, new Error("Operación cancelada."));
      } else if (key === "\r" || key === "\n") {
        finish(resolve, password);
      } else if (key === "\u007f" || key === "\b") {
        password = password.slice(0, -1);
      } else if (key && !key.includes("\u001b") && [...key].every((character) => character.charCodeAt(0) >= 32)) {
        password += key;
      }
    };

    stdout.write("Ingresá una contraseña administrativa (mínimo 12 caracteres): ");
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

try {
  const password = await readHiddenPassword();
  if (password.length < 12 || password.length > 200) {
    throw new Error("La contraseña debe tener entre 12 y 200 caracteres.");
  }
  console.log(`Hash bcrypt:\n${await bcrypt.hash(password, 12)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "No se pudo generar el hash.");
  process.exitCode = 1;
}
