import { useEffect, useState } from 'react';
import api from './services/api';
import { useNavigate } from 'react-router-dom';

function Projetos() {
    const [projetos, setProjetos] = useState([]);
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (!usuario) navigate('/');
        carregarProjetos();
    }, []);

    const carregarProjetos = async () => {
        try {
            const res = await api.get('/projetos');
            setProjetos(res.data);
        } catch (error) {
            console.error("Erro ao carregar projetos", error);
        }
    };

    const irParaKanban = (idProjeto) => {
        navigate(`/kanban/${idProjeto}`);
    };

    return (
        <div className="container mt-4">
            <h2>Meus Projetos</h2>
            <div className="row mt-3">
                {projetos.map(projeto => (
                    <div key={projeto.id} className="col-md-4 mb-3">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{projeto.nome}</h5>
                                <p className="card-text">{projeto.descricao}</p>
                                <button onClick={() => irParaKanban(projeto.id)} className="btn btn-outline-primary">
                                    Abrir Kanban
                                </button>
                            </div>
                            <div className="card-footer text-muted">
                                Gerente: {projeto.gerente?.nome}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Projetos;