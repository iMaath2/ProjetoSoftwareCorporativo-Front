import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Projetos from './Projetos';
import Kanban from './Kanban';
import Cadastro from './Cadastro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/" element={<Login />} />
        <Route path="/projetos" element={<Projetos />} />
        <Route path="/kanban/:id" element={<Kanban />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;