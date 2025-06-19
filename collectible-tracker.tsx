import React, { useState, useEffect } from 'react';
import { Camera, Plus, Search, Heart, TrendingUp, Package, Gamepad2, Coins, Book, Dices, Blocks, X, Edit3, Trash2, Star } from 'lucide-react';

const CollectibleTracker = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [collections, setCollections] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    condition: 'mint',
    image: null,
    rating: 5
  });

  // Dati di esempio per il prototipo
  useEffect(() => {
    const sampleData = [
      {
        id: 1,
        name: 'Charizard Base Set',
        category: 'Carte',
        price: 450,
        condition: 'near mint',
        description: 'Carta Pokemon Charizard della serie base',
        image: '🃏',
        dateAdded: '2024-12-01',
        rating: 5
      },
      {
        id: 2,
        name: 'Amazing Spider-Man #1',
        category: 'Fumetti',
        price: 1200,
        condition: 'good',
        description: 'Primo numero Amazing Spider-Man 1963',
        image: '📚',
        dateAdded: '2024-11-15',
        rating: 4
      },
      {
        id: 3,
        name: 'LEGO Creator Expert Big Ben',
        category: 'Lego',
        price: 250,
        condition: 'mint',
        description: 'Set LEGO Big Ben 10253 completo',
        image: '🧱',
        dateAdded: '2024-12-10',
        rating: 5
      },
      {
        id: 4,
        name: 'Funko Pop Batman',
        category: 'Action Figures',
        price: 35,
        condition: 'mint',
        description: 'Funko Pop esclusivo Batman Dark Knight',
        image: '🦸',
        dateAdded: '2024-12-05',
        rating: 4
      }
    ];

    const sampleWishlist = [
      {
        id: 101,
        name: 'Black Lotus Alpha',
        category: 'Carte',
        targetPrice: 8000,
        currentPrice: 12000,
        image: '🃏',
        priority: 'high'
      },
      {
        id: 102,
        name: 'Nintendo GameBoy Color',
        category: 'Videogiochi',
        targetPrice: 80,
        currentPrice: 120,
        image: '🎮',
        priority: 'medium'
      },
      {
        id: 103,
        name: 'Detective Comics #27',
        category: 'Fumetti',
        targetPrice: 15000,
        currentPrice: 18000,
        image: '📚',
        priority: 'high'
      }
    ];

    setCollections(sampleData);
    setWishlist(sampleWishlist);
  }, []);

  const categoryIcons = {
    'Carte': '🃏',
    'Fumetti': '📚',
    'Monete': '🪙',
    'Action Figures': '🦸',
    'Lego': '🧱',
    'Videogiochi': '🎮',
    'Giochi da Tavolo': '🎲'
  };

  const categories = Object.keys(categoryIcons);

  const addToCollection = () => {
    if (newItem.name && newItem.category) {
      const item = {
        id: editingItem ? editingItem.id : Date.now(),
        ...newItem,
        price: parseFloat(newItem.price) || 0,
        dateAdded: editingItem ? editingItem.dateAdded : new Date().toISOString().split('T')[0],
        image: categoryIcons[newItem.category] || '📦'
      };
      
      if (editingItem) {
        setCollections(collections.map(c => c.id === editingItem.id ? item : c));
      } else {
        setCollections([...collections, item]);
      }
      
      resetForm();
    }
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      category: '',
      price: '',
      description: '',
      condition: 'mint',
      image: null,
      rating: 5
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const editItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      condition: item.condition,
      image: item.image,
      rating: item.rating || 5
    });
    setShowAddForm(true);
  };

  const deleteItem = (id) => {
    setCollections(collections.filter(item => item.id !== id));
  };

  const addToWishlist = (item) => {
    const wishlistItem = {
      id: Date.now(),
      name: item.name,
      category: item.category,
      targetPrice: Math.round(item.price * 0.8),
      currentPrice: item.price,
      image: item.image,
      priority: 'medium'
    };
    setWishlist([...wishlist, wishlistItem]);
  };

  const removeFromWishlist = (id) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const filteredCollections = collections.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = collections.reduce((sum, item) => sum + item.price, 0);
  const totalItems = collections.length;
  const avgValue = totalItems > 0 ? Math.round(totalValue / totalItems) : 0;

  const StatCard = ({ icon, label, value, color, trend }) => (
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 font-medium">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && <p className="text-xs opacity-80 mt-1">{trend}</p>}
        </div>
        <div className="text-3xl opacity-80 bg-white/20 p-2 rounded-xl">{icon}</div>
      </div>
    </div>
  );

  const RatingStars = ({ rating, editable = false, onChange }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } ${editable ? 'cursor-pointer hover:text-yellow-300' : ''}`}
          onClick={() => editable && onChange && onChange(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-8 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-8 w-20 h-20 bg-gradient-to-br from-pink-400/25 to-blue-400/25 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20"></div>
        <div className="relative flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
            CollectibleTracker
          </h1>
          <span className="bg-gradient-to-r from-white/20 to-purple-300/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-white/20">
            ALPHA v0.2
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gradient-to-r from-white via-purple-50 to-blue-50 border-b border-purple-100 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${
              activeTab === 'home' 
                ? 'border-b-2 border-gradient-to-r from-purple-500 to-blue-500 text-purple-600 bg-gradient-to-t from-purple-50 to-transparent' 
                : 'text-gray-600 hover:text-purple-500 hover:bg-purple-50/50'
            }`}
          >
            <Package className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Collezione</span>
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${
              activeTab === 'wishlist' 
                ? 'border-b-2 border-gradient-to-r from-purple-500 to-pink-500 text-pink-600 bg-gradient-to-t from-pink-50 to-transparent' 
                : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50/50'
            }`}
          >
            <Heart className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Wishlist</span>
          </button>
          <button 
            onClick={() => setActiveTab('scanner')}
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${
              activeTab === 'scanner' 
                ? 'border-b-2 border-gradient-to-r from-blue-500 to-purple-500 text-blue-600 bg-gradient-to-t from-blue-50 to-transparent' 
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50/50'
            }`}
          >
            <Camera className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Scanner</span>
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${
              activeTab === 'stats' 
                ? 'border-b-2 border-gradient-to-r from-pink-500 to-purple-500 text-purple-600 bg-gradient-to-t from-purple-50 to-transparent' 
                : 'text-gray-600 hover:text-purple-500 hover:bg-purple-50/50'
            }`}
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Statistiche</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 relative z-10 pb-20">
        {activeTab === 'home' && (
          <div>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Cerca nella collezione..."
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg focus:shadow-purple-200/50 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Aggiungi Oggetto</span>
            </button>

            {/* Collection Grid */}
            <div className="space-y-3">
              {filteredCollections.map(item => (
                <div key={item.id} className="bg-white/90 backdrop-blur-sm border border-purple-100 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-purple-200/30 transition-all duration-300 transform hover:scale-102">
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">{item.image}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-purple-600 font-medium">{item.category}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-2 mt-2">
                        <RatingStars rating={item.rating || 5} />
                        <span className="text-xs text-gray-500">({item.rating || 5}/5)</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">€{item.price}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.condition === 'mint' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                          item.condition === 'near mint' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800' :
                          'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800'
                        }`}>
                          {item.condition}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => editItem(item)}
                        className="text-gray-400 hover:text-blue-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addToWishlist(item)}
                        className="text-gray-400 hover:text-pink-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-pink-50"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">La mia Wishlist</h2>
            <div className="space-y-3">
              {wishlist.map(item => (
                <div key={item.id} className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-pink-200/30 transition-all duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg">{item.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-pink-600 font-medium">{item.category}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-sm text-gray-500">Target: <span className="font-medium text-green-600">€{item.targetPrice}</span></p>
                          <p className="text-sm font-semibold text-red-600">Attuale: €{item.currentPrice}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Differenza</p>
                          <p className="text-sm font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">+€{item.currentPrice - item.targetPrice}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="text-center">
            <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm rounded-2xl p-8 mb-4 border border-blue-100 shadow-lg">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-2xl w-fit mx-auto mb-4">
                <Camera className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Scanner AI</h3>
              <p className="text-gray-600 mb-4">Scansiona o carica una foto del tuo oggetto collezionabile</p>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-4">
                Avvia Scanner
              </button>
              <div className="text-xs text-gray-500">
                Funzionalità in sviluppo - Coming Soon!
              </div>
            </div>
            
            <div className="text-left bg-gradient-to-br from-purple-50/90 to-pink-50/90 backdrop-blur-sm p-4 rounded-2xl border border-purple-100 shadow-lg">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center">
                <span className="text-2xl mr-2">🤖</span>
                Funzionalità AI Previste
              </h4>
              <ul className="text-sm text-purple-800 space-y-2">
                <li className="flex items-center"><span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-2"></span>Riconoscimento automatico oggetti</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-2"></span>Auto-completamento informazioni</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-2"></span>Rilevamento duplicati</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-2"></span>Stima prezzi di mercato</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-2"></span>Analisi condizioni oggetto</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Statistiche Collezione</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard 
                icon="📦" 
                label="Oggetti Totali" 
                value={totalItems} 
                color="bg-gradient-to-br from-purple-500 to-pink-500"
                trend="+2 questo mese"
              />
              <StatCard 
                icon="💰" 
                label="Valore Totale" 
                value={`€${totalValue}`} 
                color="bg-gradient-to-br from-blue-500 to-purple-500"
                trend="↗️ +15% vs mese scorso"
              />
              <StatCard 
                icon="📊" 
                label="Valore Medio" 
                value={`€${avgValue}`} 
                color="bg-gradient-to-br from-green-500 to-blue-500"
              />
              <StatCard 
                icon="❤️" 
                label="Wishlist Items" 
                value={wishlist.length} 
                color="bg-gradient-to-br from-pink-500 to-red-500"
              />
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-purple-100 rounded-2xl p-4 mb-4 shadow-lg">
              <h3 className="font-bold mb-3 text-gray-900">Distribuzione per Categoria</h3>
              <div className="space-y-3">
                {Object.entries(
                  collections.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([category, count]) => {
                  const percentage = Math.round((count / totalItems) * 100);
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{categoryIcons[category]}</span>
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                        </div>
                        <span className="font-bold text-purple-600 bg-white px-2 py-1 rounded-full text-sm">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 shadow-lg">
              <h3 className="font-bold mb-3 text-gray-900">Top 3 - Oggetti più Costosi</h3>
              <div className="space-y-3">
                {collections
                  .sort((a, b) => b.price - a.price)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-xl">{item.image}</span>
                        <div>
                          <span className="text-sm font-medium text-gray-700 block">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.category}</span>
                        </div>
                      </div>
                      <span className="font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">€{item.price}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {editingItem ? 'Modifica Oggetto' : 'Aggiungi Oggetto'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome oggetto"
                className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
              
              <select
                className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              >
                <option value="">Seleziona categoria</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Prezzo (€)"
                className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              />
              
              <textarea
                placeholder="Descrizione (opzionale)"
                className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                rows="3"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              />
              
              <select
                className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                value={newItem.condition}
                onChange={(e) => setNewItem({...newItem, condition: e.target.value})}
              >
                <option value="mint">🌟 Mint - Perfetto</option>
                <option value="near mint">✨ Near Mint - Quasi perfetto</option>
                <option value="good">👍 Good - Buone condizioni</option>
                <option value="fair">⚠️ Fair - Condizioni discrete</option>
                <option value="poor">💔 Poor - Condizioni povere</option>
              </select>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valutazione personale
                </label>
                <RatingStars 
                  rating={newItem.rating} 
                  editable={true} 
                  onChange={(rating) => setNewItem({...newItem, rating})}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
              >
                Annulla
              </button>
              <button
                onClick={addToCollection}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {editingItem ? 'Salva' : 'Aggiungi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectibleTracker;