import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import { Package, Coffee, Shield, LayoutGrid, X, Plus, ArrowLeft, Trash2, Edit3, Search, Lock, Unlock, LogOut } from 'lucide-react';

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [setorAtivo, setSetorAtivo] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [novoItem, setNovoItem] = useState({ nome: '', qtd: '', imagem: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [itemAcoesAbertas, setItemAcoesAbertas] = useState(null);

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
    if (!isAdmin) { fazerLogin(); return; }
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
    setItemAcoesAbertas(null);
  }

  const handleExcluir = async (id) => {
    if (!isAdmin) { fazerLogin(); return; }
    if (confirm("Tem certeza que deseja excluir?")) {
      await supabase.from('produtos').delete().eq('id', id);
      carregarEstoque();
      setItemAcoesAbertas(null);
    }
  };

  const setoresConfig = [
    { id: 'rouparia', icon: <Package size={28}/>, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-400' },
    { id: 'copa', icon: <Coffee size={28}/>, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-400' },
    { id: 'guarita', icon: <Shield size={28}/>, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-400' }
  ];

  if (setorAtivo) {
    const config = setoresConfig.find(s => s.id === setorAtivo);
    return (
      <div className="min-h-screen bg-white pb-10">
        <nav className="p-3 border-b flex flex-col gap-3 bg-gray-50 sticky top-0 z-[100] shadow-sm">
          <div className="flex items-center justify-between">
            <button onClick={() => {setSetorAtivo(null); setSearchTerm('');}} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft size={20} /></button>
            <h1 className="text-base font-black uppercase text-slate-800">{setorAtivo}</h1>
            <div className="w-8"></div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-2">
                <button onClick={isAdmin ? () => setIsAdmin(false) : fazerLogin} className="flex-1 bg-white border border-gray-200 text-slate-600 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-xs">
                    {isAdmin ? <LogOut size={14}/> : <Lock size={14}/>} {isAdmin ? 'Sair' : 'Admin'}
                </button>
                <button onClick={() => isAdmin ? setModalAberto(true) : fazerLogin()} className="flex-1 bg-slate-900 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-md">
                    <Plus size={16}/> Novo
                </button>
            </div>
          </div>
        </nav>

        <div className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {produtos.filter(p => p.local === setorAtivo && p.nome.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
                <div className="aspect-square bg-gray-50 relative cursor-pointer" onClick={() => setItemAcoesAbertas(itemAcoesAbertas === item.id ? null : item.id)}>
                    <img src={item.imagem} className={`w-full h-full object-cover transition-all duration-300 ${itemAcoesAbertas === item.id ? 'brightness-50 scale-105' : ''}`} alt={item.nome} />
                    {itemAcoesAbertas === item.id && (
                      <div className="absolute inset-0 flex items-center justify-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); isAdmin ? setItemParaEditar(item) : fazerLogin(); }} className="bg-white text-amber-500 p-3 rounded-full shadow-xl"><Edit3 size={18} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleExcluir(item.id); }} className="bg-white text-red-500 p-3 rounded-full shadow-xl"><Trash2 size={18} /></button>
                      </div>
                    )}
                </div>
                <div className="p-2 text-center flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-800 text-[11px] line-clamp-1 mb-1">{item.nome}</h3>
                  <div className={`inline-block px-2 py-0.5 rounded-lg font-black text-[10px] ${config.bg} ${config.color}`}>{item.qtd} un</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(modalAberto || itemParaEditar) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[200]">
            <div className="bg-white w-full max-w-sm rounded-t-3xl md:rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-black text-slate-800">{itemParaEditar ? 'Editar' : 'Novo'}</h2>
                  <button onClick={() => {setModalAberto(false); setItemParaEditar(null);}}><X size={20}/></button>
                </div>
                <form onSubmit={(e) => salvarProduto(e, itemParaEditar?.id)} className="space-y-3">
                  <input required placeholder="Nome" className="w-full border border-gray-200 p-3 rounded-xl outline-none text-sm bg-gray-50" value={itemParaEditar ? itemParaEditar.nome : novoItem.nome} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, nome: e.target.value}) : setNovoItem({...novoItem, nome: e.target.value})} />
                  <input type="number" required placeholder="Qtd" className="w-full border border-gray-200 p-3 rounded-xl outline-none text-sm bg-gray-50" value={itemParaEditar ? itemParaEditar.qtd : novoItem.qtd} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, qtd: e.target.value}) : setNovoItem({...novoItem, qtd: e.target.value})} />
                  <input placeholder="Link Imagem" className="w-full border border-gray-200 p-3 rounded-xl outline-none text-sm bg-gray-50" value={itemParaEditar ? itemParaEditar.imagem : novoItem.imagem} onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, imagem: e.target.value}) : setNovoItem({...novoItem, imagem: e.target.value})} />
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-3 rounded-xl text-sm">SALVAR</button>
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
        <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
          <LayoutGrid className="text-white" size={30} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">UPA QUIXADÁ</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Gestão de Estoque</p>
      </header>

      {/* GRID HORIZONTAL COM HOVER CORRIGIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {setoresConfig.map(setor => (
          <button 
            key={setor.id} 
            onClick={() => setSetorAtivo(setor.id)} 
            className={`bg-white p-8 rounded-[32px] shadow-sm flex flex-col items-center border-2 border-transparent transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl active:scale-95 ${setor.border}`}
          >
            <div className={`${setor.bg} ${setor.color} p-5 rounded-2xl mb-4`}>
              {setor.icon}
            </div>
            <h2 className="text-xl font-black text-slate-800 capitalize mb-1">{setor.id}</h2>
            <div className={`text-4xl font-black ${setor.color}`}>
              {produtos.filter(p => p.local === setor.id).reduce((acc, item) => acc + (Number(item.qtd) || 0), 0)}
            </div>
          </button>
        ))}
      </div>

      {isAdmin && (
        <button onClick={() => setIsAdmin(false)} className="mt-10 px-6 py-2 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-colors">
          Sair do Modo Admin
        </button>
      )}
    </div>
  );
}