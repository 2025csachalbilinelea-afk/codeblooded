import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const children = new Set();
let shuttingDown = false;

function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = exitCode;

  for (const child of children) {
    if (child.exitCode === null) child.kill();
  }
}

function startProcess(name, args) {
  const child = spawn(process.execPath, args, {
    cwd: projectDirectory,
    stdio: 'inherit',
  });
  children.add(child);

  child.on('error', (error) => {
    console.error(`[${name}] Failed to start: ${error.message}`);
    stop(1);
  });

  child.on('exit', (code, signal) => {
    children.delete(child);
    if (!shuttingDown) {
      const status = signal ? `signal ${signal}` : `exit code ${code}`;
      console.error(`[${name}] Stopped unexpectedly with ${status}.`);
      stop(code ?? 1);
    }
  });
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

startProcess('API server', [path.join(projectDirectory, 'scripts', 'server.mjs')]);
startProcess('Vite', [
  path.join(projectDirectory, 'node_modules', 'vite', 'bin', 'vite.js'),
  ...process.argv.slice(2),
]);
