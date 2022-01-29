
import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
import typescript from '@rollup/plugin-typescript';

dotenv.config();
console.log('building in mode:', process.env.MODE)
const variablesToReplace = Object.entries(process.env)
	.filter(([key]) => key.match(/APP_CROSSWORDS_.+/))
	.reduce((variablesToReplace, [key, value]) => {
		variablesToReplace[`process.env.${key}`] = JSON.stringify(value)
		return variablesToReplace;
	}, {})
	console.log('variables to replace:', variablesToReplace)

	const plugins =[
		replace(variablesToReplace),
		resolve(),
		json(),
		typescript(),
		commonjs(),
	]

export default {
	input: 'lib/index.js',
	output: [
		{ file: pkg.main, format: 'cjs' },
	],
	plugins
};
