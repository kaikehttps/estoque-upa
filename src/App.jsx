import React, { useState, useEffect } from 'react';
import { supabase } from 'suparbaseClient'; 
import { Package, Coffee, Shield, LayoutGrid, X, Plus, ArrowLeft, Trash2, Edit3, Search, Lock, Unlock, LogOut } from 'lucide-react';

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [setorAtivo, setSetorAtivo] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [novoItem, setNovoItem] = useState({ nome: '', qtd: '', imagem: '' });
  const [isAdmin, setIsAdmin] = useState(false);

  const SENHA_ACESSO = "794613";

  const fazerLogin = () => {
    const senha = prompt("Digite a senha de administrador:");
    if (senha === SENHA_ACESSO) {
      setIsAdmin(true);
      alert("Acesso de Administrador liberado!");
    } else {
      alert("Senha incorreta!");
    }
  };

  async function carregarEstoque() {
    const { data } = await supabase.from('produtos').select('*').order('nome');
    if (data) setProdutos(data);
  }

  useEffect(() => { carregarEstoque(); }, []);

  async function salvarProduto(e, id = null) {
    e.preventDefault();
    if (!isAdmin) {
      fazerLogin();
      return;
    }

    const dados = id ? itemParaEditar : novoItem;
    const itemDados = { 
      nome: dados.nome, 
      qtd: parseInt(dados.qtd), 
      imagem: dados.imagem || 'https://placehold.co/200x200?text=Sem+Foto',
      local: setorAtivo 
    };
    
    if (id) {
      await supabase.from('produtos').update(itemDados).eq('id', id);
      setItemParaEditar(null);
    } else {
      await supabase.from('produtos').insert([itemDados]);
      setModalAberto(false);
      setNovoItem({ nome: '', qtd: '', imagem: '' });
    }
    carregarEstoque();
  }

  const handleExcluir = async (id) => {
    if (!isAdmin) {
      fazerLogin();
      return;
    }
    if (confirm("Tem certeza que deseja excluir este item?")) {
      await supabase.from('produtos').delete().eq('id', id);
      carregarEstoque();
    }
  };

  const totalPorSetor = (setor) => {
    return produtos.filter(p => p.local === setor).reduce((acc, item) => acc + (Number(item.qtd) || 0), 0);
  };

  const produtosFiltrados = produtos.filter(p => 
    p.local === setorAtivo && 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const setoresConfig = [
    { id: 'rouparia', icon: <Package size={40}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'copa', icon: <Coffee size={40}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'guarita', icon: <Shield size={40}/>, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  if (setorAtivo) {
    const config = setoresConfig.find(s => s.id === setorAtivo);
    return (
      <div className="min-h-screen bg-white pb-10">
        {/* Nav com Z-INDEX alto para cobrir tudo ao rolar */}
        <nav className="p-4 border-b flex flex-col gap-4 bg-gray-50 sticky top-0 z-[100] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button onClick={() => {setSetorAtivo(null); setSearchTerm('');}} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-black uppercase text-slate-800">{setorAtivo}</h1>
            </div>
            {isAdmin && <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg uppercase">Admin</span>}
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button onClick={isAdmin ? () => setIsAdmin(false) : fazerLogin} className="flex-1 border-2 border-slate-200 text-slate-600 p-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-white">
                    {isAdmin ? <LogOut size={18}/> : <Lock size={18}/>}
                    {isAdmin ? 'Sair' : 'Entrar'}
                </button>
                <button onClick={() => isAdmin ? setModalAberto(true) : fazerLogin()} className="flex-1 bg-slate-900 text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
                    <Plus size={20}/> Novo
                </button>
            </div>
          </div>
        </nav>

        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {produtosFiltrados.map(item => (
              <div key={item.id} className="group bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative flex flex-col">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img src={item.imagem} className="w-full h-full object-cover" alt={item.nome} />
                    
                    {/* BOTÕES FIXADOS NO CARD: z-10 e dentro do relative do card */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => isAdmin ? setItemParaEditar(item) : fazerLogin()} className="bg-white/95 p-2.5 rounded-full text-amber-500 shadow-lg active:scale-90 transition-transform"><Edit3 size={18} /></button>
                        <button onClick={() => handleExcluir(item.id)} className="bg-white/95 p-2.5 rounded-full text-red-500 shadow-lg active:scale-90 transition-transform"><Trash2 size={18} /></button>
                    </div>
                </div>

                <div className="p-3 text-center flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-700 text-sm line-clamp-2 mb-2">{item.nome}</h3>
                  <div className={`inline-block px-4 py-1.5 rounded-full font-black text-sm ${config.bg} ${config.color}`}>
                    {item.qtd} un
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal em camada superior máxima */}
        {(modalAberto || itemParaEditar) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-[200]">
            <div className="bg-white w-full max-w-md rounded-t-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-800">{itemParaEditar ? 'Editar Item' : 'Novo Item'}</h2>
                  <button className="p-2" onClick={() => {setModalAberto(false); setItemParaEditar(null);}}><X/></button>
                </div>
                <form onSubmit={(e) => salvarProduto(e, itemParaEditar?.id)} className="space-y-4">
                  <input required placeholder="Nome do Produto" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none text-base focus:border-blue-500" value={itemParaEditar ? itemParaEditar.nome : novoItem.nome} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, nome: e.target.value}) : setNovoItem({...novoItem, nome: e.target.value})} />
                  <input type="number" required placeholder="Quantidade" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none text-base focus:border-blue-500" value={itemParaEditar ? itemParaEditar.qtd : novoItem.qtd} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, qtd: e.target.value}) : setNovoItem({...novoItem, qtd: e.target.value})} />
                  <input placeholder="URL da Imagem" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none text-base focus:border-blue-500" value={itemParaEditar ? itemParaEditar.imagem : novoItem.imagem} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, imagem: e.target.value}) : setNovoItem({...novoItem, imagem: e.target.value})} />
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl mt-4 shadow-lg active:scale-95 transition-transform">SALVAR</button>
                </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TELA INICIAL (Setores) - Mantida para manter a fluidez
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10">
        <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-4 relative">
          <LayoutGrid className="text-white" size={32} />
          {isAdmin && <Unlock size={16} className="absolute -top-1 -right-1 text-green-400 bg-white rounded-full p-1 shadow" />}
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">UPA QUIXADÁ</h1>
        <div className="flex items-center justify-center gap-2">
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Gestão de Estoque</p>
           {isAdmin && <button onClick={() => setIsAdmin(false)} className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-lg font-black uppercase">Sair</button>}
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {setoresConfig.map(setor => (
          <button key={setor.id} onClick={() => setSetorAtivo(setor.id)} className="bg-white p-10 rounded-[48px] shadow-sm active:scale-95 transition-all flex flex-col items-center border border-gray-100 hover:shadow-xl group">
            <div className={`${setor.bg} ${setor.color} p-7 rounded-[32px] mb-6 group-hover:scale-110 transition-transform`}>{setor.icon}</div>
            <h2 className="text-xl font-black text-slate-800 capitalize mb-2">{setor.id}</h2>
            <div className={`text-5xl font-black ${setor.color}`}>{totalPorSetor(setor.id)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}