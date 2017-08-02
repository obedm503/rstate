import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import plugin from 'rollup-plugin-typescript';
// import typescript from 'typescript';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: './dist/esm/rstate.js',
  dest: './dist/bundle/rstate.js',
  format: 'umd',
  moduleName: 'Rstate',
  sourceMap: true,
  plugins: [
    // plugin({ typescript }),
    resolve(),
    commonjs({
      // explicitly specify unresolvable named exports
      // (see below for more details)
      // namedExports: { './module.js': ['foo', 'bar' ] },  // Default: undefined
    }),
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  ]
}
