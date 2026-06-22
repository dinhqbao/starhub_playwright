import { execSync } from 'child_process';

const PLATFORMS = {
    web: { project: 'web-chromium', dir: 'tests/web' },
    app: { project: 'app-android',  dir: 'tests/app' },
};

const noauth = process.argv.includes('--noauth');
const args = process.argv.slice(2).filter(a => a !== '--noauth');

const [platform, filename, grep] = args;

const config = PLATFORMS[platform];
if (!config) {
    console.error(`Unknown platform: "${platform}". Use: ${Object.keys(PLATFORMS).join(', ')}.`);
    process.exit(1);
}

if (noauth) process.env.NOAUTH = 'true';

const testPath = filename ? `${config.dir}/${filename}.spec.ts` : config.dir;
const grepFlag = grep ? ` -g "${grep}"` : '';

const cmd = `playwright test --project=${config.project} "${testPath}"${grepFlag}`;
console.log(`> ${noauth ? '[noauth] ' : ''}${cmd}\n`);
execSync(cmd, { stdio: 'inherit' });
