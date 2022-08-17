/* @refresh reload */
import { render } from 'solid-js/web';

import App from './App';
import { main } from './main';

render(() => <App />, document.getElementById('root') as HTMLElement);

main();
