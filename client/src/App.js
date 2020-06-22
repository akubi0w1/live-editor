import React from 'react';
import logo from './logo.svg';
import './App.css';
import './assets/live-editor.css';
import LiveEditor from './parts/LiveEditor';
import Editor from './pages/Editor'
import { BrowserRouter, Route } from 'react-router-dom';
import NoteList from './pages/List';
import Create from './pages/Create';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Route exact path="/" component={NoteList} />
        {/* test path: /7c74a4bd-1e50-41fb-91ed-5bd6e93b9842 */}
        <Route exact path="/create" component={Create} />
        <Route exact path="/edit/:id" component={Editor}/>
      </BrowserRouter>
      {/* <LiveEditor id="id1"/> */}
    </>
  );
}

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;
