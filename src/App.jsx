import React, { useState, useEffect } from 'react';
import { supabase } from './suparbaseClient';
import { Package, Coffee, Shield, LayoutGrid, X, Plus, ArrowLeft, Trash2, Edit3, Search } from 'lucide-react';

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [setorAtivo, setSetorAtivo] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); // Estado para a pesquisa
  const [modalAberto, setModalAberto] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [novoItem, setNovoItem] = useState({ nome: '', qtd: '', imagem: '' });

  async function carregarEstoque() {
    const { data } = await supabase.from('produtos').select('*').order('nome');
    if (data) setProdutos(data);
  }

  useEffect(() => { carregarEstoque(); }, []);

  async function salvarProduto(e, id = null) {
    e.preventDefault();
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

  const totalPorSetor = (setor) => {
    return produtos.filter(p => p.local === setor).reduce((acc, item) => acc + (Number(item.qtd) || 0), 0);
  };

  // Lógica de filtragem (Setor + Pesquisa)
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
        <nav className="p-4 md:p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button onClick={() => {setSetorAtivo(null); setSearchTerm('');}} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft size={24} /></button>
            <h1 className="text-lg md:text-xl font-black uppercase text-slate-800 tracking-tight">{setorAtivo}</h1>
          </div>
          
          {/* BARRA DE PESQUISA */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Pesquisar produto..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={() => setModalAberto(true)} className="w-full md:w-auto bg-slate-900 text-white px-6 py-2 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95">
            <Plus size={20}/> Novo
          </button>
        </nav>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {produtosFiltrados.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {produtosFiltrados.map(item => (
                <div key={item.id} className="group bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative transition-all hover:shadow-md">
                  <div className="aspect-square bg-gray-100">
                      <img src={item.imagem} className="w-full h-full object-cover" alt={item.nome} />
                  </div>
                  
                  <div className="absolute top-2 right-2 flex flex-col gap-2 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => setItemParaEditar(item)} className="bg-white/95 p-3 rounded-full text-amber-500 shadow-xl active:scale-90 transition-transform"><Edit3 size={18} /></button>
                    <button onClick={() => { if(confirm("Excluir item?")) supabase.from('produtos').delete().eq('id', item.id).then(carregarEstoque) }} className="bg-white/95 p-3 rounded-full text-red-500 shadow-xl active:scale-90 transition-transform"><Trash2 size={18} /></button>
                  </div>

                  <div className="p-3 text-center">
                    <h3 className="font-bold text-slate-700 truncate text-xs md:text-sm mb-1">{item.nome}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full font-black text-[10px] md:text-sm ${config.bg} ${config.color}`}>{item.qtd} un</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 font-bold">Nenhum produto encontrado com "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Modal de Cadastro */}
        {(modalAberto || itemParaEditar) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
            <div className="bg-white w-full max-w-md rounded-t-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-800">{itemParaEditar ? 'Editar Item' : 'Novo Item'}</h2>
                  <button className="p-2" onClick={() => {setModalAberto(false); setItemParaEditar(null);}}><X/></button>
                </div>
                <form onSubmit={(e) => salvarProduto(e, itemParaEditar?.id)} className="space-y-4">
                  <input required placeholder="Nome do Produto" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none text-base focus:border-blue-500" 
                    value={itemParaEditar ? itemParaEditar.nome : novoItem.nome} 
                    onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, nome: e.target.value}) : setNovoItem({...novoItem, nome: e.target.value})} />
                  <input type="number" required placeholder="Quantidade" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none text-base focus:border-blue-500" 
                    value={itemParaEditar ? itemParaEditar.qtd : novoItem.qtd} 
                    onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, qtd: e.target.value}) : setNovoItem({...novoItem, qtd: e.target.value})} />
                  <input placeholder="URL da Imagem" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none text-base focus:border-blue-500" 
                    value={itemParaEditar ? itemParaEditar.imagem : novoItem.imagem} 
                    onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, imagem: e.target.value}) : setNovoItem({...novoItem, imagem: e.target.value})} />
                  <button type="submit" className={`w-full text-white font-black py-4 rounded-2xl mt-4 shadow-lg active:scale-95 transition-transform ${itemParaEditar ? 'bg-amber-500' : 'bg-blue-600'}`}>
                    {itemParaEditar ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR ITEM'}
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
        <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4"><LayoutGrid className="text-white" size={32} /></div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">UPA QUIXADÁ</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Gestão de Estoque</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {setoresConfig.map(setor => (
          <button key={setor.id} onClick={() => setSetorAtivo(setor.id)} className="bg-white p-8 rounded-[40px] shadow-sm active:scale-95 transition-all flex flex-col items-center border border-gray-50 hover:shadow-xl group">
            <div className={`${setor.bg} ${setor.color} p-6 rounded-[30px] mb-6 group-hover:scale-110 transition-transform`}>{setor.icon}</div>
            <h2 className="text-xl font-black text-slate-800 capitalize mb-2">{setor.id}</h2>
            <div className={`text-4xl font-black ${setor.color}`}>{totalPorSetor(setor.id)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}