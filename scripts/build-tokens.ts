import StyleDictionary from 'style-dictionary'
import { color, spacing, breakpoint } from '../src/lib/styles/tokens'

function toSD(obj: Record<string, string>): Record<string, { value: string }> {
	return Object.fromEntries(
		Object.entries(obj).map(([key, val]) => [key, { value: val }]),
	)
}

StyleDictionary.registerFormat({
	name: 'css/custom-media',
	format: ({ dictionary }) => {
		return (
			dictionary.allTokens
				.map((t) => `@custom-media --${t.path[1]} ${t.value};`)
				.join('\n') + '\n'
		)
	},
})

StyleDictionary.registerFormat({
	name: 'javascript/ts-tokens',
	format: ({ dictionary }) => {
		return (
			dictionary.allTokens
				.map((t) => {
					const name = t.path
						.map((p) =>
							p
								.split(/[-\s]/)
								.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
								.join(''),
						)
						.join('')
					const value =
						t.path[0] === 'spacing'
							? parseFloat(t.value)
							: JSON.stringify(t.value)
					return `export const ${name} = ${value};`
				})
				.join('\n') + '\n'
		)
	},
})

const sd = new StyleDictionary({
	tokens: {
		...toSD(color),
		spacing: toSD(spacing),
		breakpoint: toSD(breakpoint),
	},
	platforms: {
		css: {
			transformGroup: 'css',
			buildPath: 'src/lib/styles/generated/',
			files: [
				{
					destination: 'tokens.css',
					format: 'css/variables',
					filter: (t) => t.path[0] !== 'breakpoint',
				},
			],
		},
		ts: {
			transformGroup: 'js',
			buildPath: 'src/lib/styles/generated/',
			files: [
				{
					destination: 'index.ts',
					format: 'javascript/ts-tokens',
					filter: (t) => t.path.length > 1,
				},
			],
		},
		pcss: {
			transformGroup: 'css',
			buildPath: 'src/lib/styles/generated/',
			files: [
				{
					destination: 'breakpoints.pcss',
					format: 'css/custom-media',
					filter: (t) => t.path[0] === 'breakpoint',
				},
			],
		},
	},
})

await sd.buildAllPlatforms()
