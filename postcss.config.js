export default {
	plugins: {
		'@csstools/postcss-global-data': {
			files: ['src/lib/styles/generated/breakpoints.pcss'],
		},
		'postcss-nested': {},
		'postcss-preset-env': {
			stage: 0,
		},
	},
}
