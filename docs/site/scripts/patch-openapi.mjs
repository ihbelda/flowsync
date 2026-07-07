#!/usr/bin/env node
// adonis-autoswagger referencia components.schemas.ValidationError en las
// respuestas 422 de las rutas validadas con VineJS, pero en algunos entornos
// no llega a incluir la definición de ese schema en el spec generado (se ha
// observado en CI/Linux aunque no en macOS, con la misma versión anclada de
// la librería — no se ha podido aislar la causa exacta). starlight-openapi
// valida los $ref de forma estricta y rompe el build entero si falta, así
// que este script rellena el hueco de forma idempotente tras generar
// openapi.yaml.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const specPath = join(siteRoot, 'openapi.yaml');

const spec = yaml.load(readFileSync(specPath, 'utf8'));

spec.components ??= {};
spec.components.schemas ??= {};

if (spec.components.schemas.ValidationError) {
	console.log('openapi.yaml ya define ValidationError, sin cambios');
} else {
	// Forma real de VineJS: ValidationException#messages -> { errors: [...] }.
	spec.components.schemas.ValidationError = {
		type: 'object',
		properties: {
			errors: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						message: { type: 'string' },
						rule: { type: 'string' },
						field: { type: 'string' },
					},
				},
			},
		},
	};
	writeFileSync(specPath, yaml.dump(spec));
	console.log('patched: components.schemas.ValidationError añadido a openapi.yaml');
}
