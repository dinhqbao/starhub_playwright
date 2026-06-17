import prompts from 'prompts';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const csvPath = resolve(__dirname, '../accounts.csv');

function parseCSV() {
    const lines = readFileSync(csvPath, 'utf-8').trim().split('\n');
    const header = lines[0];
    const rows = lines
        .slice(1)
        .filter((l) => l.trim())
        .map((line) => {
            const [email, password, selected, ...descParts] = line.split(',');
            return {
                email: email.trim(),
                password: password?.trim() ?? '',
                selected: selected?.trim() === 'true',
                description: descParts.join(',').trim(),
                raw: line,
            };
        });
    return { header, rows };
}

function writeCSV(header, rows) {
    const lines = [
        header,
        ...rows.map((r) => `${r.email},${r.password},${r.selected},${r.description}`),
    ];
    writeFileSync(csvPath, lines.join('\n') + '\n');
}

(async () => {
    const { header, rows } = parseCSV();

    if (rows.length === 0) {
        console.error('No accounts found in accounts.csv');
        process.exit(1);
    }

    const currentSelected = rows.find((r) => r.selected);

    const response = await prompts({
        type: 'select',
        name: 'email',
        message: 'Select account to use for tests',
        choices: rows.map((r) => ({
            title: r.description ? `${r.email}  (${r.description})` : r.email,
            value: r.email,
            description: r.selected ? '← currently selected' : '',
        })),
        initial: currentSelected ? rows.indexOf(currentSelected) : 0,
    });

    if (!response.email) {
        console.log('No account selected. Exiting.');
        process.exit(0);
    }

    const updatedRows = rows.map((r) => ({ ...r, selected: r.email === response.email }));
    writeCSV(header, updatedRows);

    console.log(`\n✓ Selected: ${response.email}`);
    console.log('Run your tests with: npx playwright test ...\n');
})();
