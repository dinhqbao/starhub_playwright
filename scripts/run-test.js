import { execSync } from 'child_process';

const PLATFORMS = {
    web:   { project: 'web-chromium', dir: 'tests/web' },
    app:   { project: 'app-android',  dir: 'tests/app' },
    phone: { project: 'web-phone',    dir: 'tests/web' },
};

const noauth = process.argv.includes('--noauth');
const args = process.argv.slice(2).filter(a => a !== '--noauth');

const positional = args.filter(a => !a.startsWith('--'));
const flags = args.filter(a => a.startsWith('--'));

const [platform, filename, grep] = positional;

const config = PLATFORMS[platform];
if (!config) {
    console.error(`Unknown platform: "${platform}". Use: ${Object.keys(PLATFORMS).join(', ')}.`);
    process.exit(1);
}

if (noauth) process.env.NOAUTH = 'true';
process.env.PLATFORM = platform;

const testPath = filename ? `${config.dir}/${filename}.spec.ts` : config.dir;
const grepFlag = grep ? ` -g "${grep}"` : '';
const extraFlags = flags.length ? ' ' + flags.join(' ') : '';

const cmd = `playwright test --project=${config.project} "${testPath}"${grepFlag}${extraFlags}`;
console.log(`> ${noauth ? '[noauth] ' : ''}${cmd}\n`);
execSync(cmd, { stdio: 'inherit' });
