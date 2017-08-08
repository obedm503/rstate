import test from 'ava';
import { combineHandlers } from './combineHandlers';

test( 'combineHandlers is function', t => {
  t.is( typeof combineHandlers, 'function' );
});
