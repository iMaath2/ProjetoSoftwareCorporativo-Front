import { useState } from 'react';
import api from './services/api';
import { useNavigate, Link } from 'react-router-dom';

function Cadastro() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        papelId: 2 // Define como GERENTE por padrão para facilitar testes
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        try {
            await api.post('/usuarios/cadastrar', formData);
            alert('Usuário cadastrado! Faça login.');
            navigate('/');
        } catch (error) {
            alert('Erro ao cadastrar. Tente outro email.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow">
                        <div className="card-header bg-success text-white">Criar Conta</div>
                        <div className="card-body">
                            <form onSubmit={handleCadastro}>
                                <div className="mb-3">
                                    <label>Nome</label>
                                    <input name="nome" className="form-control" onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label>Email</label>
                                    <input name="email" type="email" className="form-control" onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label>Senha</label>
                                    <input name="senha" type="password" className="form-control" onChange={handleChange} required />
                                </div>
                                <button type="submit" className="btn btn-success w-100">Cadastrar</button>
                            </form>
                            <div className="mt-3 text-center">
                                <Link to="/">Voltar para Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cadastro;