import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, Modal } from 'react-native';
import axios from 'axios';

const MAX_RODADAS = 5;

const App = () => {
  const [pokemon, setPokemon] = useState({});
  const [palpite, setPalpite] = useState('');
  const [retorno, setRetorno] = useState('');
  const [pontuacao, setPontuacao] = useState(0);
  const [rodadasRestantes, setRodadasRestantes] = useState(MAX_RODADAS);
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState(null);
  const [mostrarBotaoProximo, setMostrarBotaoProximo] = useState(false);
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (jogoIniciado && rodadasRestantes > 0) {
      buscarNovoPokemon();
    }
  }, [jogoIniciado]);

  useEffect(() => {
    if (mostrarRanking) {
      buscarRanking();
    }
  }, [mostrarRanking]);

  const buscarNovoPokemon = async () => {
    try {
      const id = Math.floor(Math.random() * 1000) + 1;
      const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const dados = await resposta.json();
      setPokemon(dados);
      setRetorno('');
      setMostrarBotaoProximo(false);
    } catch (erro) {
      console.error(erro);
    }
  };

  const verificarPalpite = () => {
    if (palpite.toLowerCase() === pokemon.name.toLowerCase()) {
      setRetorno('Acertou!');
      setPontuacao(pontuacao + 1);
    } else {
      setRetorno('Errado. Tente outra vez!');
    }
    setPalpite('');
    setRodadasRestantes(rodadasRestantes - 1);

    if (rodadasRestantes > 1) {
      setMostrarBotaoProximo(true);
    } else {
      setJogoIniciado(false);
      setResultadoFinal(pontuacao);
      setModalVisible(true); 
    }
  };

  const salvarPontuacao = async () => {
    try {
      await axios.post('http://172.16.11.20:3000/save-score', {
        nome,
        pontuacao
      });
      setModalVisible(false);
      setMostrarRanking(true); 
    } catch (erro) {
      console.error('Erro ao salvar a pontuação:', erro);
    }
  };

  const mostrarProximoPokemon = () => {
    buscarNovoPokemon();
    setMostrarBotaoProximo(false);
  };

  const reiniciarJogo = () => {
    setPontuacao(0);
    setRodadasRestantes(MAX_RODADAS);
    setResultadoFinal(null);
    setJogoIniciado(true);
    setMostrarBotaoProximo(false);
    setMostrarRanking(true); 
  };

  const buscarRanking = async () => {
    try {
      const resposta = await axios.get('http://172.16.11.20:3000/ranking');
      setRanking(resposta.data);
    } catch (erro) {
      console.error('Erro ao buscar o ranking:', erro);
    }
  };

  const renderRankingItem = ({ item }) => (
    <View style={estilos.itemRanking}>
      <Text style={estilos.textoRanking}>{item.nome}: {item.pontuacao}</Text>
    </View>
  );

  const BotaoPersonalizado = ({ onPress, titulo }) => (
    <TouchableOpacity style={estilos.botao} onPress={onPress}>
      <Text style={estilos.textoBotao}>{titulo}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={estilos.container}>
      {resultadoFinal !== null ? (
        <View style={estilos.telaResultado}>
          <Text style={estilos.tituloResultado}>Resultado Final</Text>
          <Text style={estilos.pontuacaoResultado}>Você teve {resultadoFinal} acertos!</Text>
          <BotaoPersonalizado 
            titulo="Reiniciar Desafio" 
            onPress={reiniciarJogo} 
          />
        </View>
      ) : !jogoIniciado ? (
        <View style={estilos.telaInicio}>
          <Text style={estilos.titulo}>Bem-vindo ao Desafio Pokémon!</Text>
          <BotaoPersonalizado 
            titulo="Começar Jogo" 
            onPress={() => setJogoIniciado(true)} 
          />
        </View>
      ) : mostrarRanking ? (
        <View style={estilos.telaRanking}>
          <Text style={estilos.titulo}>Classificação dos Jogadores</Text>
          <FlatList
            data={ranking}
            renderItem={renderRankingItem}
            keyExtractor={(item, index) => index.toString()}
          />
          <BotaoPersonalizado
            titulo="Voltar ao Início"
            onPress={() => setMostrarRanking(false)}
          />
        </View>
      ) : (
        <View style={estilos.telaJogo}>
          <Text style={estilos.titulo}>Identifique o Pokémon</Text>
          <Image
            source={{ uri: pokemon.sprites?.front_default }}
            style={estilos.imagem}
          />
          <TextInput
            style={estilos.input}
            value={palpite}
            onChangeText={setPalpite}
            placeholder="Digite o nome do Pokémon"
            placeholderTextColor="#FFFFFF"
          />
          <BotaoPersonalizado 
            titulo="Enviar Palpite" 
            onPress={verificarPalpite} 
          />
          {retorno ? <Text style={estilos.retorno}>{retorno}</Text> : null}
          <Text style={estilos.pontuacao}>Pontuação: {pontuacao}</Text>
          <Text style={estilos.pontuacao}>Rodadas Restantes: {rodadasRestantes}</Text>
          {mostrarBotaoProximo ? (
            <BotaoPersonalizado 
              titulo="Próximo Pokémon" 
              onPress={mostrarProximoPokemon} 
            />
          ) : null}
        </View>
      )}

      {/* Modal para entrada do nome */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={estilos.modalContainer}>
          <View style={estilos.modalContent}>
            <Text style={estilos.modalTitle}>Insira Seu Nome</Text>
            <TextInput
              style={estilos.modalInput}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor="#FFFFFF"
            />
            <BotaoPersonalizado 
              titulo="Registrar Pontuação" 
              onPress={salvarPontuacao} 
            />
            <BotaoPersonalizado 
              titulo="Cancelar" 
              onPress={() => setModalVisible(false)} 
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000000',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  tituloResultado: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  imagem: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 16,
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  input: {
    height: 40,
    borderColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 16,
    width: '80%',
    paddingHorizontal: 12,
    backgroundColor: '#000000',
    color: '#FFFFFF',
  },
  retorno: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  pontuacao: {
    fontSize: 18,
    marginTop: 16,
    color: '#FFFFFF',
  },
  telaInicio: {
    alignItems: 'center',
  },
  telaJogo: {
    alignItems: 'center',
  },
  telaResultado: {
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pontuacaoResultado: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  botao: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#FF0000',
    marginTop: 10,
  },
  textoBotao: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  telaRanking: {
    alignItems: 'center',
    padding: 20,
  },
  itemRanking: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    width: '100%',
  },
  textoRanking: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#000000',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  modalInput: {
    height: 40,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#000000',
    color: '#FFFFFF',
  },
});

export default App;
