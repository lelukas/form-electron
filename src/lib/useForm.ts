type Rule<T> = (v: T) => string | null

type Rules<T> = {
	[K in keyof T]?: Rule<T[K]> | Rule<T[K]>[]
}

type Errors<T> = Partial<Record<keyof T, string>>

export function createForm<T extends Record<string, any>>(initial: T, rules: Rules<T>) {
	let values = $state<T>({ ...initial })
	let touched = $state<Partial<Record<keyof T, boolean>>>({})
	let submitted = $state(false)

	const errors = $derived<Errors<T>>(() => {
		const errs: Errors<T> = {}
		for (const key in rules) {
			const ruleOrArr = rules[key]
			if (!ruleOrArr) continue
			const arr = Array.isArray(ruleOrArr) ? ruleOrArr : [ruleOrArr]
			for (const rule of arr) {
				const msg = rule(values[key])
				if (msg) {
					errs[key] = msg
					break
				}
			}
		}
		return errs
	})

	const isValid = $derived(Object.keys(errors).length === 0)

	const showErrors = $derived(submitted || Object.keys(touched).length > 0)

	function field(key: keyof T) {
		return {
			get value() {
				return values[key]
			},
			set value(v: T[keyof T]) {
				values[key] = v
			},
			get error() {
				return showErrors ? errors[key] : undefined
			},
			touch() {
				touched[key] = true
			},
		}
	}

	function handleSubmit(cb: (vals: T) => void) {
		return () => {
			submitted = true
			if (!isValid) return
			cb({ ...values })
		}
	}

	function reset() {
		values = { ...initial }
		touched = {}
		submitted = false
	}

	return { values, errors, touched, isValid, showErrors, field, handleSubmit, reset }
}
