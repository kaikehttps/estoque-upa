import React, { useState, useEffect } from 'react';
import { supabase } from './suparbaseClient';
import { Package, Coffee, Shield, LayoutGrid, X, Plus, ArrowLeft, Trash2, Edit3, Link } from 'lucide-react';

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [setorAtivo, setSetorAtivo] = useState(null); 
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

  const setoresConfig = [
    { id: 'rouparia', icon: <Package size={40}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'copa', icon: <Coffee size={40}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'guarita', icon: <Shield size={40}/>, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  if (setorAtivo) {
    const config = setoresConfig.find(s => s.id === setorAtivo);
    return (
      <div className="min-h-screen bg-white">
        <nav className="p-4 md:p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setSetorAtivo(null)} className="p-2 hover:bg-gray-200 rounded-full transition"><ArrowLeft size={24} /></button>
            <h1 className="text-lg md:text-xl font-black uppercase text-slate-800">Setor: {setorAtivo}</h1>
          </div>
          <button onClick={() => setModalAberto(true)} className="bg-slate-900 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-2xl font-bold flex items-center gap-2 text-sm md:text-base">
            <Plus size={20}/> Novo <span className="hidden md:inline">Item</span>
          </button>
        </nav>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {produtos.filter(p => p.local === setorAtivo).map(item => (
              <div key={item.id} className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all relative">
                <div className="aspect-square bg-gray-100"><img src={item.imagem} className="w-full h-full object-cover" /></div>
                <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setItemParaEditar(item)} className="bg-white/90 p-2 rounded-full text-amber-500 shadow-sm"><Edit3 size={16} /></button>
                  <button onClick={() => { if(confirm("Excluir?")) supabase.from('produtos').delete().eq('id', item.id).then(carregarEstoque) }} className="bg-white/90 p-2 rounded-full text-red-500 shadow-sm"><Trash2 size={16} /></button>
                </div>
                <div className="p-3 md:p-4 text-center">
                  <h3 className="font-bold text-slate-700 truncate text-xs md:text-sm mb-1">{item.nome}</h3>
                  <div className={`inline-block px-3 py-1 rounded-full font-black text-[10px] md:text-sm ${config.bg} ${config.color}`}>{item.qtd} un</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(modalAberto || itemParaEditar) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
            <div className="bg-white w-full max-w-md rounded-t-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-black text-slate-800">{itemParaEditar ? 'Editar Item' : 'Novo Item'}</h2>
                  <button className="p-2" onClick={() => {setModalAberto(false); setItemParaEditar(null);}}><X/></button>
                </div>
                <form onSubmit={(e) => salvarProduto(e, itemParaEditar?.id)} className="space-y-4">
                  <input required placeholder="Nome do Produto" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 text-base" 
                    value={itemParaEditar ? itemParaEditar.nome : novoItem.nome} 
                    onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, nome: e.target.value}) : setNovoItem({...novoItem, nome: e.target.value})} />
                  
                  <input type="number" required placeholder="Quantidade" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none text-base" 
                    value={itemParaEditar ? itemParaEditar.qtd : novoItem.qtd} 
                    onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, qtd: e.target.value}) : setNovoItem({...novoItem, qtd: e.target.value})} />
                  
                  <input placeholder="URL da Imagem" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none text-base" 
                    value={itemParaEditar ? itemParaEditar.imagem : novoItem.imagem} 
                    onChange={e => itemParaEditar ? setItemParaEditar({...itemParaEditar, imagem: e.target.value}) : setNovoItem({...novoItem, imagem: e.target.value})} />

                  <button type="submit" className={`w-full text-white font-black py-4 md:py-5 rounded-2xl md:rounded-3xl mt-4 shadow-lg active:scale-95 transition-transform ${itemParaEditar ? 'bg-amber-500' : 'bg-blue-600'}`}>
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6">
      <header className="text-center mb-10 md:mb-16">
        <div className="bg-blue-600 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 md:mb-6"><LayoutGrid className="text-white" size={32} /></div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">UPA QUIXADÁ</h1>
        <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">Gestão de Estoque</p>
      </header>

      {/* Grid de Setores: 1 coluna no celular, 3 no PC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
        {setoresConfig.map(setor => (
          <button key={setor.id} onClick={() => setSetorAtivo(setor.id)} className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[55px] shadow-sm hover:shadow-2xl active:scale-95 md:hover:-translate-y-3 transition-all flex flex-col items-center group border border-gray-50">
            <div className={`${setor.bg} ${setor.color} p-6 md:p-8 rounded-[30px] md:rounded-[35px] mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-300`}>
              {setor.icon}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 capitalize mb-2">{setor.id}</h2>
            <div className={`text-4xl md:text-6xl font-black ${setor.color}`}>{totalPorSetor(setor.id)}</div>
            <p className="text-slate-300 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-4 text-center">Itens no Estoque</p>
          </button>
        ))}
      </div>
    </div>
  );
}