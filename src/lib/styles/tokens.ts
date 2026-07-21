export const color = {
	black: '#000000',
	dark: '#1e1e1e',
	'dark-100': '#232323',
	'dark-200': '#2a2a2a',
	'dark-300': '#333333',
	white: '#ffffff',
	gray: '#757575',
	'gray-100': '#a1a1a1',
	'gray-200': '#7a7a7a',
	'gray-300': '#5E5E5E',
	'gray-400': '#424242',
	error: '#e78686',
} as const

export const spacing = {
	0: '0',
	0.5: '0.313rem',
	0.6: '0.375rem',
	1: '0.625rem',
	1.3: '0.813rem',
	2: '1.25rem',
	2.5: '1.563rem',
	3: '2rem',
	4: '3rem',
	5: '4rem',
	6: '5rem',
	7: '6rem',
	8: '7rem',
	9: '8rem',
	10: '9rem',
	12: '11rem',
	14: '13rem',
	16: '15rem',
	20: '19rem',
	24: '23rem',
	26: '27rem',
	28: '31rem',
} as const

export const breakpoint = {
	sm: '(width >= 0px)',
	md: '(width >= 768px)',
	lg: '(width >= 992px)',
	xl: '(width >= 1200px)',
} as const

export const tokens = { color, spacing, breakpoint } as const
