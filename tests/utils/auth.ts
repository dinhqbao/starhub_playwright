import { readFileSync } from 'fs';
import { join } from 'path';

const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD ?? 'Slice1234';
const CSV_PATH = join(process.cwd(), 'accounts.csv');

export interface Account {
    email: string;
    password: string;
    selected: boolean;
    description: string;
}

function parseAccounts(): Account[] {
    const lines = readFileSync(CSV_PATH, 'utf-8').trim().split('\n').slice(1);
    return lines
        .filter((l) => l.trim())
        .map((line) => {
            const [email, password, selected, ...descParts] = line.split(',');
            return {
                email: email.trim(),
                password: password?.trim() || DEFAULT_PASSWORD,
                selected: selected?.trim() === 'true',
                description: descParts.join(',').trim(),
            };
        });
}

export function getSelectedAccount(): Account {
    const accounts = parseAccounts();
    const selected = accounts.find((a) => a.selected);
    if (!selected) throw new Error('No account selected. Run: npm run select');
    return selected;
}

export function getAuthFilePath(email: string): string {
    return join(process.cwd(), '.auth', `${email}.json`);
}
