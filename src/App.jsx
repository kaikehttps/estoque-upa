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
        {/* NAV COM Z-INDEX SUPER ALTO E ISOLAMENTO */}
        <nav className="p-4 border-b flex flex-col gap-4 bg-gray-50 sticky top-0 z-[999] shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button onClick={() => {setSetorAtivo(null); setSearchTerm('');}} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-black uppercase text-slate-800 tracking-tighter">{setorAtivo}</h1>
            </div>
            {isAdmin && <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-lg uppercase shadow-sm">Admin</span>}
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button onClick={isAdmin ? () => setIsAdmin(false) : fazerLogin} className="flex-1 bg-white border-2 border-gray-100 text-slate-600 p-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    {isAdmin ? <LogOut size={18}/> : <Lock size={18}/>}
                    {isAdmin ? 'Sair' : 'Entrar'}
                </button>
                <button onClick={() => isAdmin ? setModalAberto(true) : fazerLogin()} className="flex-1 bg-slate-900 text-white p-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                    <Plus size={20}/> Novo
                </button>
            </div>
          </div>
        </nav>

        <div className="p-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {produtosFiltrados.map(item => (
              <div key={item.id} className="bg-white rounded-[32px] border-2 border-gray-50 shadow-sm overflow-hidden flex flex-col relative">
                
                {/* CONTAINER DA IMAGEM COM RELATIVE PARA PRENDER OS BOTÕES */}
                <div className="aspect-square bg-gray-50 relative group">
                    <img src={item.imagem} className="w-full h-full object-cover" alt={item.nome} />
                    
                    {/* BOTÕES: md:opacity-0 para flutuar no PC, sempre visíveis no mobile */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-20 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
                        <button onClick={() => isAdmin ? setItemParaEditar(item) : fazerLogin()} className="bg-white text-amber-500 p-2.5 rounded-full shadow-2xl border border-gray-100 active:scale-90">
                            <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleExcluir(item.id)} className="bg-white text-red-500 p-2.5 rounded-full shadow-2xl border border-gray-100 active:scale-90">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-3 text-center flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-2 mb-2 leading-tight">{item.nome}</h3>
                  <div className={`inline-block px-4 py-1.5 rounded-full font-black text-xs md:text-sm ${config.bg} ${config.color}`}>
                    {item.qtd} un
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL */}
        {(modalAberto || itemParaEditar) && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-[1000]">
            <div className="bg-white w-full max-w-md rounded-t-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl border-t-4 border-blue-600">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{itemParaEditar ? 'Editar Item' : 'Novo Item'}</h2>
                  <button className="p-2 bg-gray-100 rounded-full" onClick={() => {setModalAberto(false); setItemParaEditar(null);}}><X/></button>
                </div>
                <form onSubmit={(e) => salvarProduto(e, itemParaEditar?.id)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome do Produto</label>
                    <input required className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 bg-gray-50" value={itemParaEditar ? itemParaEditar.nome : novoItem.nome} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, nome: e.target.value}) : setNovoItem({...novoItem, nome: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Quantidade Atual</label>
                    <input type="number" required className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 bg-gray-50" value={itemParaEditar ? itemParaEditar.qtd : novoItem.qtd} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, qtd: e.target.value}) : setNovoItem({...novoItem, qtd: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Link da Imagem (Opcional)</label>
                    <input className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 bg-gray-50" value={itemParaEditar ? itemParaEditar.imagem : novoItem.imagem} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, imagem: e.target.value}) : setNovoItem({...novoItem, imagem: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl mt-4 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm">
                    {itemParaEditar ? 'Salvar Alterações' : 'Cadastrar Item'}
                  </button>
                </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10">
        <div className="bg-blue-600 w-20 h-20 rounded-[32px] flex items-center justify-center shadow-2xl mx-auto mb-6 relative">
          <LayoutGrid className="text-white" size={40} />
          {isAdmin && <Unlock size={20} className="absolute -top-1 -right-1 text-green-400 bg-white rounded-full p-1 shadow-md border-2 border-green-50" />}
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">UPA QUIXADÁ</h1>
        <div className="flex items-center justify-center gap-3">
           <div className="h-[2px] w-8 bg-slate-200"></div>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Gestão de Estoque</p>
           <div className="h-[2px] w-8 bg-slate-200"></div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {setoresConfig.map(setor => (
          <button key={setor.id} onClick={() => setSetorAtivo(setor.id)} className="bg-white p-12 rounded-[56px] shadow-sm active:scale-95 transition-all flex flex-col items-center border-2 border-transparent hover:border-gray-100 hover:shadow-2xl group">
            <div className={`${setor.bg} ${setor.color} p-8 rounded-[40px] mb-6 group-hover:scale-110 transition-transform shadow-inner`}>{setor.icon}</div>
            <h2 className="text-2xl font-black text-slate-800 capitalize mb-1 tracking-tight">{setor.id}</h2>
            <div className={`text-6xl font-black ${setor.color} tracking-tighter`}>{totalPorSetor(setor.id)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}