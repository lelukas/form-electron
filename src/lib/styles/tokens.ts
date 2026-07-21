export const color = {
	dark: '#232323',
	white: '#ffffff',
	'gray-100': '#a1a1a1',
	'gray-200': '#7a7a7a',
	'gray-300': '#5E5E5E',
	'gray-400': '#424242',
} as const

export const spacing = {
	1: '0.5rem',
	2: '1rem',
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
	'sm-l': '(width >= 530px) and (max-height: 500px)',
	md: '(width >= 768px) and (min-height: 501px)',
	lg: '(width >= 992px)',
	xl: '(width >= 1200px)',
	xxl: '(width >= 1400px)',
	xxxl: '(width >= 1700px)',
} as const

export const tokens = { color, spacing, breakpoint } as const
