import { useEffect, useState } from 'react';
import api from './services/api';
import { useNavigate } from 'react-router-dom';

function Projetos() {
    const [projetos, setProjetos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [novoProjeto, setNovoProjeto] = useState({ nome: '', descricao: '' });
    
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        // Se não houver utilizador salvo, expulsa para o login
        if (!usuario) {
            navigate('/');
        } else {
            carregarProjetos();
        }
    }, []);

    const carregarProjetos = async () => {
        try {
            const res = await api.get('/projetos');
            setProjetos(res.data);
        } catch (error) {
            console.error("Erro ao carregar projetos", error);
        }
    };

    // --- NOVA FUNÇÃO DE LOGOUT ---
    const handleLogout = () => {
        localStorage.removeItem('usuario'); // Limpa os dados do navegador
        navigate('/'); // Redireciona para o Login
    };

    const criarProjeto = async (e) => {
        e.preventDefault();
        try {
            // 1. Cria Projeto
            const resProj = await api.post('/projetos', {
                nome: novoProjeto.nome,
                descricao: novoProjeto.descricao,
                gerenteId: usuario.id
            });
            
            // 2. Tenta associar Fluxo Padrão
            let idFluxo = 1;
            try {
                const resFluxo = await api.post('/fluxos/padrao');
                idFluxo = resFluxo.data.id;
            } catch (err) { /* Ignora se já existir */ }

            await api.post(`/projetos/${resProj.data.id}/fluxo/${idFluxo}?idExecutor=${usuario.id}`);

            alert('Projeto criado!');
            setShowModal(false);
            setNovoProjeto({ nome: '', descricao: '' });
            carregarProjetos();
        } catch (error) {
            alert('Erro ao criar. Verifique se você é GERENTE.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Olá, {usuario?.nome}</h2>
                
                {/* Área de Botões do Topo */}
                <div>
                    <button className="btn btn-primary me-2" onClick={() => setShowModal(!showModal)}>
                        {showModal ? 'Cancelar' : '+ Novo Projeto'}
                    </button>
                    <button className="btn btn-outline-danger" onClick={handleLogout}>
                        Sair
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="card mb-4 p-3 bg-light shadow-sm">
                    <form onSubmit={criarProjeto}>
                        <div className="row g-2">
                            <div className="col-md-4">
                                <input placeholder="Nome" className="form-control" required
                                    value={novoProjeto.nome} onChange={e => setNovoProjeto({...novoProjeto, nome: e.target.value})} />
                            </div>
                            <div className="col-md-5">
                                <input placeholder="Descrição" className="form-control"
                                    value={novoProjeto.descricao} onChange={e => setNovoProjeto({...novoProjeto, descricao: e.target.value})} />
                            </div>
                            <div className="col-md-3">
                                <button className="btn btn-success w-100">Salvar</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <h4 className="text-muted mb-3">Meus Projetos</h4>
            <div className="row">
                {projetos.map(projeto => (
                    <div key={projeto.id} className="col-md-4 mb-3">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{projeto.nome}</h5>
                                <p className="card-text text-muted small">{projeto.descricao}</p>
                                <button onClick={() => navigate(`/kanban/${projeto.id}`)} className="btn btn-outline-primary w-100 mt-2">
                                    Abrir Quadro
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {projetos.length === 0 && (
                    <div className="col-12 text-center text-muted mt-5">
                        <p>Nenhum projeto encontrado. Crie o primeiro acima!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Projetos;