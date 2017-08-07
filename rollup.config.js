import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pluginTypescript from 'rollup-plugin-typescript';
import typescript from 'typescript';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const config = {
  entry: './src/index.ts',
  dest: './dist/rstate.js',
  format: 'umd',
  moduleName: 'Rstate',
  sourceMap: true,
  plugins: [
    pluginTypescript({ typescript }),
    resolve(),
    commonjs({
      // explicitly specify unresolvable named exports
      // (see below for more details)
      // namedExports: { './module.js': ['foo', 'bar' ] },  // Default: undefined
    }),
  ]
}

if(process.env.MIN === 'true'){
  config.dest = './dist/rstate.min.js';
  config.plugins.push(uglify({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false
    }
  }, minify));
}

export default config;
