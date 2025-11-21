import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './services/api';

function Kanban() {
    const { id } = useParams(); // Pega o ID da URL
    const [projeto, setProjeto] = useState(null);
    const [tarefas, setTarefas] = useState([]);
    const [novoTitulo, setNovoTitulo] = useState('');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const navigate = useNavigate();

    useEffect(() => {
        carregarDados();
    }, [id]);

    const carregarDados = async () => {
        try {
            const res = await api.get(`/projetos/${id}`);
            setProjeto(res.data);
            setTarefas(res.data.tarefas || []);
        } catch (error) {
            alert('Erro ao carregar projeto');
            navigate('/projetos');
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
                descricao: "Criada via React",
                projetoId: id,
                criadorId: usuario.id,
                responsavelId: usuario.id
            });
            setNovoTitulo('');
            carregarDados(); // Recarrega para mostrar a nova tarefa
        } catch (error) {
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
            alert('Erro ao mover tarefa');
        }
    };

    if (!projeto) return <div>Carregando...</div>;

    if (!projeto.fluxoTrabalho) return (
        <div className="container mt-4 alert alert-warning">
            Este projeto ainda não tem um Fluxo de Trabalho associado. Associe via API/Postman primeiro.
        </div>
    );

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>{projeto.nome}</h3>
                <div className="input-group w-50">
                    <input type="text" className="form-control" placeholder="Nova Tarefa..." 
                           value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} />
                    <button className="btn btn-success" onClick={criarTarefa}>Adicionar</button>
                </div>
            </div>

            <div className="row flex-nowrap overflow-auto pb-3">
                {projeto.fluxoTrabalho.etapas.map(etapa => (
                    <div key={etapa.id} className="col-md-3">
                        <div className="card bg-light">
                            <div className="card-header fw-bold text-center text-uppercase">
                                {etapa.nome}
                            </div>
                            <div className="card-body" style={{minHeight: '400px'}}>
                                
                                {getTarefasPorEtapa(etapa.id).map(tarefa => (
                                    <div key={tarefa.id} className="card mb-2 shadow-sm">
                                        <div className="card-body p-2">
                                            <h6 className="card-title">{tarefa.titulo}</h6>
                                            <p className="card-text small text-muted mb-2">
                                                {tarefa.responsavel?.nome}
                                            </p>
                                            
                                            <div className="d-flex justify-content-between">
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