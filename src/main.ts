import './main.styles.css';
import AppComponent from './components/App/App.component.ts';

const rootAppEl = document.getElementById('app');

if (!(rootAppEl instanceof HTMLElement)) {
  throw new Error('RootAppElement is not found');
}

const App = new AppComponent({ rootAppEl });
await App.render();

export default App;
