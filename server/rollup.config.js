
import pkg from './package.json';
export default {
	input: 'lib/index.js',
		external: ['ms'],
		output: [
			{ file: pkg.main, format: 'cjs' },
		]
};
