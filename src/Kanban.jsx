import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './services/api';

function Kanban() {
    const { id } = useParams(); // Pega o ID do projeto da URL
    const [projeto, setProjeto] = useState(null);
    const [tarefas, setTarefas] = useState([]);
    const [novoTitulo, setNovoTitulo] = useState('');
    
    // Estados para gerir utilizadores e seleção de responsável
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [responsavelId, setResponsavelId] = useState(usuario ? usuario.id : '');

    const navigate = useNavigate();

    useEffect(() => {
        // Se não houver utilizador logado, volta para o login
        if (!usuario) {
            navigate('/');
            return;
        }
        carregarDados();
        carregarUsuarios();
    }, [id]);

    const carregarDados = async () => {
        try {
            const res = await api.get(`/projetos/${id}`);
            setProjeto(res.data);
            setTarefas(res.data.tarefas || []);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar projeto');
            navigate('/projetos');
        }
    };

    const carregarUsuarios = async () => {
        try {
            const res = await api.get('/usuarios');
            setListaUsuarios(res.data);
        } catch (error) {
            console.error("Erro ao carregar lista de utilizadores", error);
        }
    };

    const getTarefasPorEtapa = (etapaId) => {
        return tarefas.filter(t => t.etapaAtual.id === etapaId);
    };

    const criarTarefa = async () => {
        if (!novoTitulo) return;
        try {
            await api.post('/tarefas', {
                titulo: novoTitulo,
                descricao: "Criada via Kanban Frontend", // Pode adicionar um campo de texto para isto se quiser
                projetoId: id,
                criadorId: usuario.id,
                responsavelId: responsavelId // Usa o ID selecionado no dropdown
            });
            setNovoTitulo('');
            carregarDados(); // Recarrega o quadro para mostrar a nova tarefa
        } catch (error) {
            console.error(error);
            alert('Erro ao criar tarefa');
        }
    };

    const moverTarefa = async (tarefaId, ordemDestino) => {
        // Encontra a etapa baseada na ordem (1, 2, 3...)
        const etapaDestino = projeto.fluxoTrabalho.etapas.find(e => e.ordem === ordemDestino);
        if (!etapaDestino) return;

        try {
            await api.patch(`/tarefas/${tarefaId}/mover/${etapaDestino.id}?idExecutor=${usuario.id}`);
            carregarDados();
        } catch (error) {
            console.error(error);
            alert('Erro ao mover tarefa');
        }
    };

    if (!projeto) return <div className="container mt-5 text-center">Carregando...</div>;

    if (!projeto.fluxoTrabalho) return (
        <div className="container mt-4 alert alert-warning">
            Este projeto ainda não tem um Fluxo de Trabalho associado.
        </div>
    );

    return (
        <div className="container-fluid mt-4">
            {/* Cabeçalho e Área de Criação */}
            <div className="mb-4">
                <h3>{projeto.nome}</h3>
                <div className="card p-3 bg-light shadow-sm">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Título da nova tarefa..." 
                                value={novoTitulo} 
                                onChange={e => setNovoTitulo(e.target.value)} 
                            />
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select" 
                                value={responsavelId} 
                                onChange={e => setResponsavelId(e.target.value)}
                            >
                                {listaUsuarios.map(u => (
                                    <option key={u.id} value={u.id}>{u.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-success w-100" onClick={criarTarefa}>
                                + Adicionar
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-secondary w-100" onClick={() => navigate('/projetos')}>
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colunas do Kanban */}
            <div className="row flex-nowrap overflow-auto pb-3" style={{ minHeight: '70vh' }}>
                {projeto.fluxoTrabalho.etapas.map(etapa => (
                    <div key={etapa.id} className="col-md-3" style={{ minWidth: '260px' }}>
                        <div className="card h-100 border-0 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
                            <div className="card-header fw-bold text-center text-uppercase bg-white border-bottom">
                                {etapa.nome}
                            </div>
                            <div className="card-body p-2">
                                
                                {getTarefasPorEtapa(etapa.id).map(tarefa => (
                                    <div key={tarefa.id} className="card mb-2 border-0 shadow-sm">
                                        <div className="card-body p-3">
                                            <h6 className="card-title mb-1">{tarefa.titulo}</h6>
                                            <p className="card-text small text-muted mb-3">
                                                Resp: {tarefa.responsavel ? tarefa.responsavel.nome : 'Ninguém'}
                                            </p>
                                            
                                            <div className="d-flex justify-content-between mt-2">
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    disabled={etapa.ordem === 1}
                                                    onClick={() => moverTarefa(tarefa.id, etapa.ordem - 1)}>
                                                    &larr;
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    disabled={etapa.ordem === projeto.fluxoTrabalho.etapas.length}
                                                    onClick={() => moverTarefa(tarefa.id, etapa.ordem + 1)}>
                                                    &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Kanban;