// Resolves the exact set of built JS files an initial page load pulls in for a given
// set of SvelteKit routes, by walking the real import graph of the production build
// output. Vite/Rollup content-hashes every filename in `_app/immutable/**`, so a plain
// glob (`chunks/*.js`) can't isolate "only what this route needs" — it either matches
// nothing after the next rebuild (hash changed) or matches every route's shared vendor
// chunk indiscriminately (massively overcounting). Walking the actual `import`
// statements from each route's layout/leaf node is the only approach that stays
// accurate as hashes rotate and as Rollup's chunk-splitting boundaries shift.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const CLIENT_IMMUTABLE = '.svelte-kit/output/client/_app/immutable';
const GENERATED_APP = '.svelte-kit/generated/client/app.js';

function assertBuilt(cwd) {
	if (!existsSync(path.join(cwd, CLIENT_IMMUTABLE)) || !existsSync(path.join(cwd, GENERATED_APP))) {
		throw new Error(
			`Build output not found under ${CLIENT_IMMUTABLE}. Run \`npm run build\` before resolving route JS closures.`,
		);
	}
}

// Parses the generated route dictionary (`"/path": [~leafIndex,[layoutIndices],[...]]`)
// to find which layout/leaf node files a route depends on, without hardcoding node
// index numbers that would silently drift if routes are added, removed, or reordered.
function parseRouteNodeIndices(cwd, routePath) {
	const source = readFileSync(path.join(cwd, GENERATED_APP), 'utf8');
	const escaped = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = source.match(new RegExp(`"${escaped}":\\s*\\[~?(\\d+)(?:,\\s*\\[([^\\]]*)\\])?`));
	if (!match) {
		throw new Error(`Route "${routePath}" not found in ${GENERATED_APP}`);
	}
	const leaf = Number(match[1]);
	const layouts = (match[2] ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
		.map(Number);
	// Node 0 is the top-level root layout, always loaded, and never listed explicitly
	// in the dictionary — every route depends on it.
	return new Set([0, ...layouts, leaf]);
}

function resolveNodeFile(cwd, index) {
	const dir = path.join(cwd, CLIENT_IMMUTABLE, 'nodes');
	const prefix = `${index}.`;
	const match = readdirSync(dir).find((f) => f === `${index}.js` || f.startsWith(prefix));
	if (!match) {
		throw new Error(`No built node file found for index ${index} in ${dir}`);
	}
	return `nodes/${match}`;
}

function resolveEntryFiles(cwd) {
	const dir = path.join(cwd, CLIENT_IMMUTABLE, 'entry');
	return readdirSync(dir).map((f) => `entry/${f}`);
}

function extractRelativeImports(content) {
	const specs = new Set();
	const importRe = /(?:from|import)\s*["']([^"']+)["']/g;
	let match;
	while ((match = importRe.exec(content))) {
		if (match[1].startsWith('.')) {
			specs.add(match[1]);
		}
	}
	return specs;
}

// Recursively walks static `import` statements (dynamic `import()` calls for
// route-to-route navigation are intentionally excluded — those are lazy-loaded on
// navigation, not part of the *initial* page weight this budget measures).
function walkClosure(cwd, relPath, visited) {
	const normalized = path.normalize(relPath);
	if (visited.has(normalized)) return;
	visited.add(normalized);
	const content = readFileSync(path.join(cwd, CLIENT_IMMUTABLE, normalized), 'utf8');
	for (const spec of extractRelativeImports(content)) {
		walkClosure(cwd, path.normalize(path.join(path.dirname(normalized), spec)), visited);
	}
}

export function resolveRouteJsClosure(cwd, routePaths) {
	assertBuilt(cwd);
	const visited = new Set();
	for (const entryFile of resolveEntryFiles(cwd)) {
		walkClosure(cwd, entryFile, visited);
	}
	for (const routePath of routePaths) {
		for (const index of parseRouteNodeIndices(cwd, routePath)) {
			walkClosure(cwd, resolveNodeFile(cwd, index), visited);
		}
	}
	return [...visited].sort().map((relPath) => path.join(cwd, CLIENT_IMMUTABLE, relPath));
}
